// src/pages/admin/Clientes.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Search, Ban, RotateCcw, Users } from "lucide-react";
import toast from "react-hot-toast";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { ActionMenu } from "../../components/ui/ActionMenu";

type Cliente = {
  id: string;
  nombre: string | null;
  apellido: string | null;
  email: string | null;
  ciudad: string | null;
  creado_en: string;
  activo: boolean;
};

export default function AdminClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "cliente")
        .order("creado_en", { ascending: false });
      setClientes((data as Cliente[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const toggleActivo = async (id: string, activo: boolean) => {
    await supabase.from("profiles").update({ activo: !activo }).eq("id", id);
    setClientes((cs) =>
      cs.map((c) => (c.id === id ? { ...c, activo: !activo } : c)),
    );
    toast.success(activo ? "Cuenta suspendida" : "Cuenta reactivada");
  };

  const filtrados = search
    ? clientes.filter((c) =>
        `${c.nombre} ${c.apellido} ${c.email}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : clientes;

  const columns: Column<Cliente>[] = [
    {
      key: "cliente",
      header: "Cliente",
      cell: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
            {c.nombre?.[0]?.toUpperCase()}
          </div>
          <p className="text-sm font-medium text-gray-800">
            {c.nombre} {c.apellido}
          </p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (c) => <span className="text-sm text-gray-500">{c.email}</span>,
    },
    {
      key: "ciudad",
      header: "Ciudad",
      cell: (c) => (
        <span className="text-sm text-gray-500">{c.ciudad || "—"}</span>
      ),
    },
    {
      key: "registrado",
      header: "Registrado",
      cell: (c) => (
        <span className="text-sm text-gray-400">
          {new Date(c.creado_en).toLocaleDateString("es-PE")}
        </span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      cell: (c) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            c.activo ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {c.activo ? "Activo" : "Suspendido"}
        </span>
      ),
    },
    {
      key: "acciones",
      header: "",
      cell: (c) => (
        <ActionMenu
          items={[
            {
              label: c.activo ? "Suspender" : "Reactivar",
              icon: c.activo ? Ban : RotateCcw,
              variant: c.activo ? "danger" : "default",
              onClick: () => toggleActivo(c.id, c.activo),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-sm text-gray-500 mt-1">
          {clientes.length} clientes registrados
        </p>
      </div>
      <div className="relative max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        />
      </div>
      <DataTable
        columns={columns}
        data={filtrados}
        getRowKey={(c) => c.id}
        loading={loading}
        empty={{
          icon: <Users size={36} className="mx-auto opacity-30" />,
          title: "Sin clientes",
          subtitle: "Aún no hay clientes registrados",
        }}
      />
    </div>
  );
}
