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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          cliente_id: string
          created_at: string
          data_hora: string
          id: string
          observacoes: string | null
          servico_resumo: string | null
          status: string
          veiculo_id: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_hora: string
          id?: string
          observacoes?: string | null
          servico_resumo?: string | null
          status?: string
          veiculo_id?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_hora?: string
          id?: string
          observacoes?: string | null
          servico_resumo?: string | null
          status?: string
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          cpf_cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          numero: string | null
          telefone: string | null
          whatsapp: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          numero?: string | null
          telefone?: string | null
          whatsapp?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          numero?: string | null
          telefone?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      despesas: {
        Row: {
          categoria: string | null
          created_at: string
          data: string
          descricao: string
          id: string
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          data?: string
          descricao: string
          id?: string
          valor: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          valor?: number
        }
        Relationships: []
      }
      estoque_pecas: {
        Row: {
          codigo: string
          created_at: string
          fornecedor: string | null
          id: string
          nome: string
          preco_custo: number
          preco_venda: number
          quantidade: number
          quantidade_minima: number
          updated_at: string
        }
        Insert: {
          codigo: string
          created_at?: string
          fornecedor?: string | null
          id?: string
          nome: string
          preco_custo?: number
          preco_venda?: number
          quantidade?: number
          quantidade_minima?: number
          updated_at?: string
        }
        Update: {
          codigo?: string
          created_at?: string
          fornecedor?: string | null
          id?: string
          nome?: string
          preco_custo?: number
          preco_venda?: number
          quantidade?: number
          quantidade_minima?: number
          updated_at?: string
        }
        Relationships: []
      }
      historico_compras: {
        Row: {
          created_at: string
          data_compra: string
          fornecedor: string | null
          id: string
          peca_id: string
          quantidade: number
          valor_pago: number
        }
        Insert: {
          created_at?: string
          data_compra?: string
          fornecedor?: string | null
          id?: string
          peca_id: string
          quantidade?: number
          valor_pago?: number
        }
        Update: {
          created_at?: string
          data_compra?: string
          fornecedor?: string | null
          id?: string
          peca_id?: string
          quantidade?: number
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "historico_compras_peca_id_fkey"
            columns: ["peca_id"]
            isOneToOne: false
            referencedRelation: "estoque_pecas"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_atendimento: {
        Row: {
          canal: string
          cliente_id: string
          created_at: string
          data_combinada: string | null
          data_hora: string
          descricao: string
          id: string
          ordem_servico_id: string | null
          usuario_responsavel: string
        }
        Insert: {
          canal?: string
          cliente_id: string
          created_at?: string
          data_combinada?: string | null
          data_hora?: string
          descricao: string
          id?: string
          ordem_servico_id?: string | null
          usuario_responsavel?: string
        }
        Update: {
          canal?: string
          cliente_id?: string
          created_at?: string
          data_combinada?: string | null
          data_hora?: string
          descricao?: string
          id?: string
          ordem_servico_id?: string | null
          usuario_responsavel?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_atendimento_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_atendimento_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          cliente_id: string
          como_chegou: string | null
          created_at: string
          data_entrada: string
          data_saida: string | null
          desconto: number
          diagnostico: string | null
          id: string
          km_entrada: number | null
          o_que_foi_feito: string | null
          observacoes: string | null
          pecas_texto: string | null
          reclamacao_cliente: string | null
          status: string
          total: number
          veiculo_id: string | null
          vencimento: string | null
        }
        Insert: {
          cliente_id: string
          como_chegou?: string | null
          created_at?: string
          data_entrada?: string
          data_saida?: string | null
          desconto?: number
          diagnostico?: string | null
          id?: string
          km_entrada?: number | null
          o_que_foi_feito?: string | null
          observacoes?: string | null
          pecas_texto?: string | null
          reclamacao_cliente?: string | null
          status?: string
          total?: number
          veiculo_id?: string | null
          vencimento?: string | null
        }
        Update: {
          cliente_id?: string
          como_chegou?: string | null
          created_at?: string
          data_entrada?: string
          data_saida?: string | null
          desconto?: number
          diagnostico?: string | null
          id?: string
          km_entrada?: number | null
          o_que_foi_feito?: string | null
          observacoes?: string | null
          pecas_texto?: string | null
          reclamacao_cliente?: string | null
          status?: string
          total?: number
          veiculo_id?: string | null
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          created_at: string
          data_pagamento: string
          forma_pagamento: string
          id: string
          observacoes: string | null
          ordem_servico_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          data_pagamento?: string
          forma_pagamento?: string
          id?: string
          observacoes?: string | null
          ordem_servico_id: string
          valor: number
        }
        Update: {
          created_at?: string
          data_pagamento?: string
          forma_pagamento?: string
          id?: string
          observacoes?: string | null
          ordem_servico_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      pecas_os: {
        Row: {
          created_at: string
          descricao: string
          id: string
          ordem_servico_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          ordem_servico_id: string
          valor?: number
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          ordem_servico_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pecas_os_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      pendencias: {
        Row: {
          cliente_id: string
          created_at: string
          data_prevista: string
          descricao: string
          id: string
          log_atendimento_id: string | null
          ordem_servico_id: string | null
          responsavel: string
          status: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_prevista: string
          descricao: string
          id?: string
          log_atendimento_id?: string | null
          ordem_servico_id?: string | null
          responsavel?: string
          status?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_prevista?: string
          descricao?: string
          id?: string
          log_atendimento_id?: string | null
          ordem_servico_id?: string | null
          responsavel?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pendencias_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pendencias_log_atendimento_id_fkey"
            columns: ["log_atendimento_id"]
            isOneToOne: false
            referencedRelation: "logs_atendimento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pendencias_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos_os: {
        Row: {
          created_at: string
          descricao: string
          id: string
          ordem_servico_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          ordem_servico_id: string
          valor?: number
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          ordem_servico_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "servicos_os_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos: {
        Row: {
          ano: string | null
          cliente_id: string
          created_at: string
          id: string
          marca: string | null
          modelo: string | null
          motor: string | null
          observacoes: string | null
          placa: string | null
        }
        Insert: {
          ano?: string | null
          cliente_id: string
          created_at?: string
          id?: string
          marca?: string | null
          modelo?: string | null
          motor?: string | null
          observacoes?: string | null
          placa?: string | null
        }
        Update: {
          ano?: string | null
          cliente_id?: string
          created_at?: string
          id?: string
          marca?: string | null
          modelo?: string | null
          motor?: string | null
          observacoes?: string | null
          placa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
