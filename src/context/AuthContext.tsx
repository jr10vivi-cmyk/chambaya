import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { setCachedAuth, clearCachedAuth } from "../lib/storage";
import type { User } from "@supabase/supabase-js";
import type {
  AuthContextValue,
  ProfileConTecnico,
  SignUpParams,
  SignInParams,
} from "../types";

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};

// Envuelve una query de Supabase con un timeout explícito.
// Sin esto, si la red cuelga, la query nunca resuelve y loading queda atrapado.
function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileConTecnico | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange es el único punto de entrada al estado de auth.
    // Dispara INITIAL_SESSION al montar (con la sesión de localStorage),
    // y luego SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED según corresponda.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        await loadProfile(currentUser.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // loadProfile está fuera del useEffect para poder usarla también en refreshProfile.
  // Intenta hasta 2 veces (cubre Supabase "frío" en free tier).
  // El timeout por intento garantiza que loading SIEMPRE se resuelve.
  async function loadProfile(userId: string) {
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 1000));
        try {
          const { data, error } = await withTimeout(
            supabase
              .from("profiles")
              .select("*, tecnicos(*)")
              .eq("id", userId)
              .single(),
            6000,
          );
          if (!error && data) {
            const p = data as unknown as ProfileConTecnico;
            setProfile(p);
            setCachedAuth(p.role, userId);
            return;
          }
        } catch {
          // timeout o error de red en este intento — continuar al siguiente
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const signUp = async ({
    email,
    password,
    nombre,
    apellido,
    role,
    codigoRef,
  }: SignUpParams) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, apellido, role } },
    });
    if (error) throw error;
    if (role === "tecnico" && data.user) {
      await supabase.from("tecnicos").insert({ id: data.user.id });
    }
    if (codigoRef && data.user) {
      const { data: refProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("codigo_referido", codigoRef.toUpperCase())
        .single();
      if (refProfile) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("profiles")
          .update({ referido_por: refProfile.id, origen_registro: "referido" })
          .eq("id", data.user.id);
      }
    }
    return data;
  };

  const signIn = async ({ email, password }: SignInParams) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearCachedAuth();
    setUser(null);
    setProfile(null);
  };

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === "admin",
    isTecnico: profile?.role === "tecnico",
    isCliente: profile?.role === "cliente",
    tecnico: profile?.tecnicos ?? null,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => (user ? loadProfile(user.id) : Promise.resolve()),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
