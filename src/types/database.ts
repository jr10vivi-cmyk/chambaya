export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      alertas_seguridad: {
        Row: {
          creado_en: string | null
          id: string
          mensaje_texto: string | null
          motivo: string
          usuario_id: string | null
        }
        Insert: {
          creado_en?: string | null
          id?: string
          mensaje_texto?: string | null
          motivo: string
          usuario_id?: string | null
        }
        Update: {
          creado_en?: string | null
          id?: string
          mensaje_texto?: string | null
          motivo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alertas_seguridad_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          activo: boolean | null
          creado_en: string | null
          descripcion: string | null
          icono: string | null
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          creado_en?: string | null
          descripcion?: string | null
          icono?: string | null
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean | null
          creado_en?: string | null
          descripcion?: string | null
          icono?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      conversaciones: {
        Row: {
          cliente_id: string | null
          creado_en: string | null
          id: string
          solicitud_id: string | null
          tecnico_id: string | null
          ultimo_mensaje: string | null
          ultimo_mensaje_en: string | null
        }
        Insert: {
          cliente_id?: string | null
          creado_en?: string | null
          id?: string
          solicitud_id?: string | null
          tecnico_id?: string | null
          ultimo_mensaje?: string | null
          ultimo_mensaje_en?: string | null
        }
        Update: {
          cliente_id?: string | null
          creado_en?: string | null
          id?: string
          solicitud_id?: string | null
          tecnico_id?: string | null
          ultimo_mensaje?: string | null
          ultimo_mensaje_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversaciones_solicitud_id_fkey"
            columns: ["solicitud_id"]
            isOneToOne: false
            referencedRelation: "solicitudes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversaciones_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "tecnicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversaciones_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "vista_reputacion_tecnicos"
            referencedColumns: ["tecnico_id"]
          },
        ]
      }
      ingresos_plataforma: {
        Row: {
          descripcion: string | null
          fecha: string | null
          id: string
          monto: number
          referencia_id: string | null
          tipo: string | null
        }
        Insert: {
          descripcion?: string | null
          fecha?: string | null
          id?: string
          monto: number
          referencia_id?: string | null
          tipo?: string | null
        }
        Update: {
          descripcion?: string | null
          fecha?: string | null
          id?: string
          monto?: number
          referencia_id?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      mensajes: {
        Row: {
          bloqueado: boolean | null
          contenido: string
          conversacion_id: string | null
          creado_en: string | null
          emisor_id: string | null
          id: string
          leido: boolean | null
          tiene_contacto: boolean | null
        }
        Insert: {
          bloqueado?: boolean | null
          contenido: string
          conversacion_id?: string | null
          creado_en?: string | null
          emisor_id?: string | null
          id?: string
          leido?: boolean | null
          tiene_contacto?: boolean | null
        }
        Update: {
          bloqueado?: boolean | null
          contenido?: string
          conversacion_id?: string | null
          creado_en?: string | null
          emisor_id?: string | null
          id?: string
          leido?: boolean | null
          tiene_contacto?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "mensajes_conversacion_id_fkey"
            columns: ["conversacion_id"]
            isOneToOne: false
            referencedRelation: "conversaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensajes_emisor_id_fkey"
            columns: ["emisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          creado_en: string | null
          datos: Json | null
          id: string
          leida: boolean | null
          mensaje: string | null
          tipo: string
          titulo: string
          usuario_id: string | null
        }
        Insert: {
          creado_en?: string | null
          datos?: Json | null
          id?: string
          leida?: boolean | null
          mensaje?: string | null
          tipo: string
          titulo: string
          usuario_id?: string | null
        }
        Update: {
          creado_en?: string | null
          datos?: Json | null
          id?: string
          leida?: boolean | null
          mensaje?: string | null
          tipo?: string
          titulo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos: {
        Row: {
          cliente_id: string | null
          comision: number
          creado_en: string | null
          estado: string | null
          id: string
          metodo_pago: string | null
          monto_tecnico: number
          monto_total: number
          referencia_externa: string | null
          solicitud_id: string | null
          tecnico_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          comision: number
          creado_en?: string | null
          estado?: string | null
          id?: string
          metodo_pago?: string | null
          monto_tecnico: number
          monto_total: number
          referencia_externa?: string | null
          solicitud_id?: string | null
          tecnico_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          comision?: number
          creado_en?: string | null
          estado?: string | null
          id?: string
          metodo_pago?: string | null
          monto_tecnico?: number
          monto_total?: number
          referencia_externa?: string | null
          solicitud_id?: string | null
          tecnico_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_solicitud_id_fkey"
            columns: ["solicitud_id"]
            isOneToOne: false
            referencedRelation: "solicitudes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "tecnicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "vista_reputacion_tecnicos"
            referencedColumns: ["tecnico_id"]
          },
        ]
      }
      profiles: {
        Row: {
          activo: boolean | null
          actualizado_en: string | null
          apellido: string | null
          avatar_url: string | null
          ciudad: string | null
          creado_en: string | null
          departamento: string | null
          email: string
          estado_cuenta: string | null
          id: string
          nombre: string
          role: string
          telefono: string | null
        }
        Insert: {
          activo?: boolean | null
          actualizado_en?: string | null
          apellido?: string | null
          avatar_url?: string | null
          ciudad?: string | null
          creado_en?: string | null
          departamento?: string | null
          email: string
          estado_cuenta?: string | null
          id: string
          nombre: string
          role: string
          telefono?: string | null
        }
        Update: {
          activo?: boolean | null
          actualizado_en?: string | null
          apellido?: string | null
          avatar_url?: string | null
          ciudad?: string | null
          creado_en?: string | null
          departamento?: string | null
          email?: string
          estado_cuenta?: string | null
          id?: string
          nombre?: string
          role?: string
          telefono?: string | null
        }
        Relationships: []
      }
      publicidades: {
        Row: {
          activo: boolean | null
          clicks: number | null
          costo: number | null
          creado_en: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          imagen_url: string | null
          impresiones: number | null
          posicion: string | null
          tipo: string | null
          titulo: string
          url_destino: string | null
        }
        Insert: {
          activo?: boolean | null
          clicks?: number | null
          costo?: number | null
          creado_en?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          imagen_url?: string | null
          impresiones?: number | null
          posicion?: string | null
          tipo?: string | null
          titulo: string
          url_destino?: string | null
        }
        Update: {
          activo?: boolean | null
          clicks?: number | null
          costo?: number | null
          creado_en?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          imagen_url?: string | null
          impresiones?: number | null
          posicion?: string | null
          tipo?: string | null
          titulo?: string
          url_destino?: string | null
        }
        Relationships: []
      }
      resenas: {
        Row: {
          calificacion: number
          cliente_id: string | null
          comentario: string | null
          creado_en: string | null
          id: string
          respuesta_tecnico: string | null
          solicitud_id: string | null
          tecnico_id: string | null
        }
        Insert: {
          calificacion: number
          cliente_id?: string | null
          comentario?: string | null
          creado_en?: string | null
          id?: string
          respuesta_tecnico?: string | null
          solicitud_id?: string | null
          tecnico_id?: string | null
        }
        Update: {
          calificacion?: number
          cliente_id?: string | null
          comentario?: string | null
          creado_en?: string | null
          id?: string
          respuesta_tecnico?: string | null
          solicitud_id?: string | null
          tecnico_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resenas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resenas_solicitud_id_fkey"
            columns: ["solicitud_id"]
            isOneToOne: true
            referencedRelation: "solicitudes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resenas_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "tecnicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resenas_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "vista_reputacion_tecnicos"
            referencedColumns: ["tecnico_id"]
          },
        ]
      }
      saldo_tecnicos: {
        Row: {
          actualizado_en: string | null
          saldo_disponible: number
          saldo_total: number
          tecnico_id: string
          ultima_ganancia: string | null
        }
        Insert: {
          actualizado_en?: string | null
          saldo_disponible?: number
          saldo_total?: number
          tecnico_id: string
          ultima_ganancia?: string | null
        }
        Update: {
          actualizado_en?: string | null
          saldo_disponible?: number
          saldo_total?: number
          tecnico_id?: string
          ultima_ganancia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saldo_tecnicos_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitudes: {
        Row: {
          actualizado_en: string | null
          categoria_id: string | null
          cliente_id: string | null
          comision_plataforma: number | null
          confirmado_cliente: boolean | null
          creado_en: string | null
          descripcion: string
          direccion: string
          estado: string | null
          fecha_aceptado: string | null
          fecha_cancelado: string | null
          fecha_completado: string | null
          fecha_inicio: string | null
          fecha_solicitud: string | null
          ganancia_tecnico: number | null
          id: string
          lat: number | null
          lng: number | null
          notas_tecnico: string | null
          pago_liberado: boolean | null
          precio_acordado: number | null
          presupuesto_cliente: number | null
          tecnico_id: string | null
          titulo: string
        }
        Insert: {
          actualizado_en?: string | null
          categoria_id?: string | null
          cliente_id?: string | null
          comision_plataforma?: number | null
          confirmado_cliente?: boolean | null
          creado_en?: string | null
          descripcion: string
          direccion: string
          estado?: string | null
          fecha_aceptado?: string | null
          fecha_cancelado?: string | null
          fecha_completado?: string | null
          fecha_inicio?: string | null
          fecha_solicitud?: string | null
          ganancia_tecnico?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          notas_tecnico?: string | null
          pago_liberado?: boolean | null
          precio_acordado?: number | null
          presupuesto_cliente?: number | null
          tecnico_id?: string | null
          titulo: string
        }
        Update: {
          actualizado_en?: string | null
          categoria_id?: string | null
          cliente_id?: string | null
          comision_plataforma?: number | null
          confirmado_cliente?: boolean | null
          creado_en?: string | null
          descripcion?: string
          direccion?: string
          estado?: string | null
          fecha_aceptado?: string | null
          fecha_cancelado?: string | null
          fecha_completado?: string | null
          fecha_inicio?: string | null
          fecha_solicitud?: string | null
          ganancia_tecnico?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          notas_tecnico?: string | null
          pago_liberado?: boolean | null
          precio_acordado?: number | null
          presupuesto_cliente?: number | null
          tecnico_id?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitudes_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitudes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitudes_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "tecnicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitudes_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "vista_reputacion_tecnicos"
            referencedColumns: ["tecnico_id"]
          },
        ]
      }
      suscripciones: {
        Row: {
          creado_en: string | null
          estado: string | null
          fin: string
          id: string
          inicio: string | null
          plan: string
          precio: number
          renovacion_automatica: boolean | null
          tecnico_id: string | null
        }
        Insert: {
          creado_en?: string | null
          estado?: string | null
          fin: string
          id?: string
          inicio?: string | null
          plan: string
          precio: number
          renovacion_automatica?: boolean | null
          tecnico_id?: string | null
        }
        Update: {
          creado_en?: string | null
          estado?: string | null
          fin?: string
          id?: string
          inicio?: string | null
          plan?: string
          precio?: number
          renovacion_automatica?: boolean | null
          tecnico_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suscripciones_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "tecnicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suscripciones_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "vista_reputacion_tecnicos"
            referencedColumns: ["tecnico_id"]
          },
        ]
      }
      tecnico_categorias: {
        Row: {
          categoria_id: string | null
          id: string
          tecnico_id: string | null
        }
        Insert: {
          categoria_id?: string | null
          id?: string
          tecnico_id?: string | null
        }
        Update: {
          categoria_id?: string | null
          id?: string
          tecnico_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tecnico_categorias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tecnico_categorias_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "tecnicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tecnico_categorias_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "vista_reputacion_tecnicos"
            referencedColumns: ["tecnico_id"]
          },
        ]
      }
      tecnico_fotos: {
        Row: {
          creado_en: string | null
          descripcion: string | null
          id: string
          tecnico_id: string | null
          url: string
        }
        Insert: {
          creado_en?: string | null
          descripcion?: string | null
          id?: string
          tecnico_id?: string | null
          url: string
        }
        Update: {
          creado_en?: string | null
          descripcion?: string | null
          id?: string
          tecnico_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "tecnico_fotos_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "tecnicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tecnico_fotos_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "vista_reputacion_tecnicos"
            referencedColumns: ["tecnico_id"]
          },
        ]
      }
      tecnicos: {
        Row: {
          actualizado_en: string | null
          calificacion_promedio: number | null
          creado_en: string | null
          descripcion: string | null
          disponible: boolean | null
          es_premium: boolean | null
          estado_verificacion: string | null
          experiencia_anos: number | null
          id: string
          lat: number | null
          lng: number | null
          premium_hasta: string | null
          radio_servicio_km: number | null
          tarifa_hora: number | null
          tarifa_minima: number | null
          total_resenas: number | null
          total_trabajos: number | null
        }
        Insert: {
          actualizado_en?: string | null
          calificacion_promedio?: number | null
          creado_en?: string | null
          descripcion?: string | null
          disponible?: boolean | null
          es_premium?: boolean | null
          estado_verificacion?: string | null
          experiencia_anos?: number | null
          id: string
          lat?: number | null
          lng?: number | null
          premium_hasta?: string | null
          radio_servicio_km?: number | null
          tarifa_hora?: number | null
          tarifa_minima?: number | null
          total_resenas?: number | null
          total_trabajos?: number | null
        }
        Update: {
          actualizado_en?: string | null
          calificacion_promedio?: number | null
          creado_en?: string | null
          descripcion?: string | null
          disponible?: boolean | null
          es_premium?: boolean | null
          estado_verificacion?: string | null
          experiencia_anos?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          premium_hasta?: string | null
          radio_servicio_km?: number | null
          tarifa_hora?: number | null
          tarifa_minima?: number | null
          total_resenas?: number | null
          total_trabajos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tecnicos_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vista_reputacion_tecnicos: {
        Row: {
          apellido: string | null
          calificacion_promedio: number | null
          nombre: string | null
          tecnico_id: string | null
          total_resenas: number | null
          total_trabajos: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tecnicos_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      activar_premium: {
        Args: { p_plan: string; p_precio: number; p_tecnico_id: string }
        Returns: string
      }
      registrar_click: { Args: { p_anuncio_id: string }; Returns: undefined }
      registrar_impresion: {
        Args: { p_anuncio_id: string }
        Returns: undefined
      }
      registrar_ingreso: {
        Args: {
          p_descripcion?: string
          p_monto: number
          p_referencia_id?: string
          p_tipo: string
        }
        Returns: undefined
      }
      verificar_suscripciones_expiradas: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
