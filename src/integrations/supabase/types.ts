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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      affiliate_accounts: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          created_at: string
          data_status: Database["public"]["Enums"]["data_status"]
          email: string
          group_id: string | null
          id: string
          notes: string | null
          password: string
          phone_number: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          updated_at: string
          username: string
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"]
          created_at?: string
          data_status?: Database["public"]["Enums"]["data_status"]
          email: string
          group_id?: string | null
          id?: string
          notes?: string | null
          password: string
          phone_number?: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          updated_at?: string
          username: string
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          created_at?: string
          data_status?: Database["public"]["Enums"]["data_status"]
          email?: string
          group_id?: string | null
          id?: string
          notes?: string | null
          password?: string
          phone_number?: string | null
          platform?: Database["public"]["Enums"]["platform_type"]
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_accounts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          purchase_date: string
          purchase_price: number
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          purchase_date: string
          purchase_price: number
          quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          purchase_date?: string
          purchase_price?: number
          quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          check_in: string
          check_out: string | null
          created_at: string
          date: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          check_in?: string
          check_out?: string | null
          created_at?: string
          date?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          check_in?: string
          check_out?: string | null
          created_at?: string
          date?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_trail: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          new_values: Json | null
          old_values: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_trail_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_reports: {
        Row: {
          account_id: string
          created_at: string
          disbursed_commission: number
          end_date: string
          gross_commission: number
          id: string
          net_commission: number
          start_date: string
          updated_at: string
          week_period: string
        }
        Insert: {
          account_id: string
          created_at?: string
          disbursed_commission?: number
          end_date: string
          gross_commission?: number
          id?: string
          net_commission?: number
          start_date: string
          updated_at?: string
          week_period: string
        }
        Update: {
          account_id?: string
          created_at?: string
          disbursed_commission?: number
          end_date?: string
          gross_commission?: number
          id?: string
          net_commission?: number
          start_date?: string
          updated_at?: string
          week_period?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_reports_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "affiliate_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_reports: {
        Row: {
          account_id: string
          category: string
          created_at: string
          device_id: string
          ending_balance: number
          ending_omzet: number
          group_id: string
          id: string
          live_status: Database["public"]["Enums"]["live_status"]
          report_date: string
          shift: Database["public"]["Enums"]["shift_type"]
          starting_balance: number
          starting_omzet: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          category: string
          created_at?: string
          device_id: string
          ending_balance?: number
          ending_omzet?: number
          group_id: string
          id?: string
          live_status?: Database["public"]["Enums"]["live_status"]
          report_date?: string
          shift: Database["public"]["Enums"]["shift_type"]
          starting_balance?: number
          starting_omzet?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          category?: string
          created_at?: string
          device_id?: string
          ending_balance?: number
          ending_omzet?: number
          group_id?: string
          id?: string
          live_status?: Database["public"]["Enums"]["live_status"]
          report_date?: string
          shift?: Database["public"]["Enums"]["shift_type"]
          starting_balance?: number
          starting_omzet?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_reports_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "affiliate_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          amount: number
          created_at: string
          description: string
          due_date: string | null
          id: string
          status: string
          transaction_date: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          status?: string
          transaction_date?: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          status?: string
          transaction_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          created_at: string
          device_id: string
          google_account: string | null
          group_id: string | null
          id: string
          imei: string
          purchase_date: string | null
          purchase_price: number | null
          screenshot_link: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_id: string
          google_account?: string | null
          group_id?: string | null
          id?: string
          imei: string
          purchase_date?: string | null
          purchase_price?: number | null
          screenshot_link?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_id?: string
          google_account?: string | null
          group_id?: string | null
          id?: string
          imei?: string
          purchase_date?: string | null
          purchase_price?: number | null
          screenshot_link?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      kpi_targets: {
        Row: {
          created_at: string
          group_id: string | null
          id: string
          period_month: number
          period_year: number
          target_attendance_days: number
          target_gross_commission: number
          target_omzet: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          group_id?: string | null
          id?: string
          period_month: number
          period_year: number
          target_attendance_days?: number
          target_gross_commission?: number
          target_omzet?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          group_id?: string | null
          id?: string
          period_month?: number
          period_year?: number
          target_attendance_days?: number
          target_gross_commission?: number
          target_omzet?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_targets_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_targets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string
          full_name: string
          group_id: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          start_date: string
          updated_at: string
          username: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          full_name: string
          group_id?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          start_date?: string
          updated_at?: string
          username: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          full_name?: string
          group_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          start_date?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_group"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      sop_documents: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          file_url: string | null
          id: string
          link_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          file_url?: string | null
          id?: string
          link_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          file_url?: string | null
          id?: string
          link_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sop_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string
          description: string
          expense_category:
            | Database["public"]["Enums"]["expense_category"]
            | null
          id: string
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by: string
          description: string
          expense_category?:
            | Database["public"]["Enums"]["expense_category"]
            | null
          id?: string
          transaction_date?: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          expense_category?:
            | Database["public"]["Enums"]["expense_category"]
            | null
          id?: string
          transaction_date?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      account_status: "active" | "banned_temporary" | "banned_permanent"
      data_status: "empty" | "in_process" | "rejected" | "verified"
      expense_category: "fixed_cost" | "variable_cost"
      live_status: "lancar" | "mati" | "relive"
      platform_type: "shopee" | "tiktok"
      shift_type: "1" | "2" | "3"
      transaction_type: "income" | "expense"
      user_role: "superadmin" | "leader" | "admin" | "staff" | "viewer"
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
    Enums: {
      account_status: ["active", "banned_temporary", "banned_permanent"],
      data_status: ["empty", "in_process", "rejected", "verified"],
      expense_category: ["fixed_cost", "variable_cost"],
      live_status: ["lancar", "mati", "relive"],
      platform_type: ["shopee", "tiktok"],
      shift_type: ["1", "2", "3"],
      transaction_type: ["income", "expense"],
      user_role: ["superadmin", "leader", "admin", "staff", "viewer"],
    },
  },
} as const
