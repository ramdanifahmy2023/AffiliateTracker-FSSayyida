export type UserRole = 'superadmin' | 'leader' | 'admin' | 'staff' | 'viewer';
export type UserPosition = 'superadmin' | 'leader' | 'admin' | 'staff_host_live' | 'staff_content_creator' | 'viewer';
export type PlatformType = 'shopee' | 'tiktok';
export type AccountStatus = 'active' | 'temp_banned' | 'perm_banned';
export type DataStatus = 'empty' | 'pending' | 'rejected' | 'verified';
export type ShiftType = '1' | '2' | '3';
export type ProductCategory = 'fashion' | 'elektronik' | 'kecantikan' | 'food' | 'hobi' | 'otomotif' | 'lainnya';
export type LiveStatus = 'lancar' | 'mati' | 'relive';
export type PeriodWeek = 'M1' | 'M2' | 'M3' | 'M4' | 'M5';
export type TransactionType = 'income' | 'expense';
export type CostCategory = 'fix_cost' | 'variable_cost';
export type DebtType = 'debt' | 'receivable';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';
export type FileType = 'pdf' | 'google_drive' | 'youtube';
export type AuditAction = 'create' | 'update' | 'delete';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          birth_date: string | null;
          role: UserRole;
          username: string;
          address: string | null;
          start_date: string;
          group_id: string | null;
          created_at: string;
          updated_at: string;
          password: string | null;
          position: UserPosition;
          email?: string | null; // Tambahan kolom email
        };
        Insert: {
          id: string; // Required untuk auth.users foreign key
          full_name: string;
          birth_date?: string | null;
          role?: UserRole;
          username: string;
          address?: string | null;
          start_date?: string;
          group_id?: string | null;
          created_at?: string;
          updated_at?: string;
          password?: string | null;
          position?: UserPosition;
          email?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          birth_date?: string | null;
          role?: UserRole;
          username?: string;
          address?: string | null;
          start_date?: string;
          group_id?: string | null;
          created_at?: string;
          updated_at?: string;
          password?: string | null;
          position?: UserPosition;
          email?: string | null;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
          group_name: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
          group_name?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          group_name?: string | null;
        };
      };
      devices: {
        Row: {
          id: string;
          device_id: string;
          imei: string;
          google_account: string | null;
          purchase_date: string | null;
          purchase_price: number | null;
          screenshot_link: string | null;
          group_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          imei: string;
          google_account?: string | null;
          purchase_date?: string | null;
          purchase_price?: number | null;
          screenshot_link?: string | null;
          group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          device_id?: string;
          imei?: string;
          google_account?: string | null;
          purchase_date?: string | null;
          purchase_price?: number | null;
          screenshot_link?: string | null;
          group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      affiliate_accounts: {
        Row: {
          id: string;
          platform: PlatformType;
          email: string;
          password: string;
          username: string;
          phone_number: string | null;
          account_status: AccountStatus;
          data_status: DataStatus;
          notes: string | null;
          group_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          platform: PlatformType;
          email: string;
          password: string;
          username: string;
          phone_number?: string | null;
          account_status?: AccountStatus;
          data_status?: DataStatus;
          notes?: string | null;
          group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          platform?: PlatformType;
          email?: string;
          password?: string;
          username?: string;
          phone_number?: string | null;
          account_status?: AccountStatus;
          data_status?: DataStatus;
          notes?: string | null;
          group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_reports: {
        Row: {
          id: string;
          user_id: string;
          group_id: string;
          device_id: string;
          account_id: string;
          report_date: string;
          shift: ShiftType;
          category: string;
          live_status: LiveStatus;
          starting_balance: number;
          ending_balance: number;
          starting_omzet: number;
          ending_omzet: number;
          created_at: string;
          updated_at: string;
          opening_balance: number | null;
          closing_balance: number | null;
          product_category: ProductCategory | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          group_id: string;
          device_id: string;
          account_id: string;
          report_date?: string;
          shift: ShiftType;
          category: string;
          live_status?: LiveStatus;
          starting_balance?: number;
          ending_balance?: number;
          starting_omzet?: number;
          ending_omzet?: number;
          created_at?: string;
          updated_at?: string;
          opening_balance?: number | null;
          closing_balance?: number | null;
          product_category?: ProductCategory | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          group_id?: string;
          device_id?: string;
          account_id?: string;
          report_date?: string;
          shift?: ShiftType;
          category?: string;
          live_status?: LiveStatus;
          starting_balance?: number;
          ending_balance?: number;
          starting_omzet?: number;
          ending_omzet?: number;
          created_at?: string;
          updated_at?: string;
          opening_balance?: number | null;
          closing_balance?: number | null;
          product_category?: ProductCategory | null;
        };
      };
      commissions: {
        Row: {
          id: string;
          account_username: string;
          period_week: PeriodWeek;
          period_month: number;
          period_year: number;
          gross_commission: number | null;
          net_commission: number | null;
          liquid_commission: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          account_username: string;
          period_week: PeriodWeek;
          period_month: number;
          period_year: number;
          gross_commission?: number | null;
          net_commission?: number | null;
          liquid_commission?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          account_username?: string;
          period_week?: PeriodWeek;
          period_month?: number;
          period_year?: number;
          gross_commission?: number | null;
          net_commission?: number | null;
          liquid_commission?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      commission_reports: {
        Row: {
          id: string;
          account_id: string;
          week_period: string;
          start_date: string;
          end_date: string;
          gross_commission: number;
          net_commission: number;
          disbursed_commission: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          week_period: string;
          start_date: string;
          end_date: string;
          gross_commission?: number;
          net_commission?: number;
          disbursed_commission?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          week_period?: string;
          start_date?: string;
          end_date?: string;
          gross_commission?: number;
          net_commission?: number;
          disbursed_commission?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      cashflow: {
        Row: {
          id: string;
          transaction_date: string;
          type: TransactionType;
          group_id: string | null;
          amount: number;
          proof_link: string | null;
          category: CostCategory | null;
          description: string;
          created_by: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          transaction_date: string;
          type: TransactionType;
          group_id?: string | null;
          amount: number;
          proof_link?: string | null;
          category?: CostCategory | null;
          description: string;
          created_by: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          transaction_date?: string;
          type?: TransactionType;
          group_id?: string | null;
          amount?: number;
          proof_link?: string | null;
          category?: CostCategory | null;
          description?: string;
          created_by?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      assets: {
        Row: {
          id: string;
          name: string;
          purchase_date: string;
          purchase_price: number;
          quantity: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
          group_id: string | null;
          description: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          purchase_date: string;
          purchase_price: number;
          quantity?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          group_id?: string | null;
          description?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          purchase_date?: string;
          purchase_price?: number;
          quantity?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          group_id?: string | null;
          description?: string | null;
        };
      };
      debt_receivables: {
        Row: {
          id: string;
          transaction_date: string;
          type: DebtType;
          amount: number;
          description: string;
          status: PaymentStatus;
          group_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          transaction_date: string;
          type: DebtType;
          amount: number;
          description: string;
          status?: PaymentStatus;
          group_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          transaction_date?: string;
          type?: DebtType;
          amount?: number;
          description?: string;
          status?: PaymentStatus;
          group_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      debts: {
        Row: {
          id: string;
          type: string;
          amount: number;
          description: string;
          due_date: string | null;
          status: string;
          transaction_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          amount: number;
          description: string;
          due_date?: string | null;
          status?: string;
          transaction_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          amount?: number;
          description?: string;
          due_date?: string | null;
          status?: string;
          transaction_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          user_id: string;
          check_in: string;
          check_out: string | null;
          date: string;
          created_at: string;
          updated_at: string;
          attendance_date: string | null;
          check_in_time: string | null;
          check_out_time: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          check_in?: string;
          check_out?: string | null;
          date?: string;
          created_at?: string;
          updated_at?: string;
          attendance_date?: string | null;
          check_in_time?: string | null;
          check_out_time?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          check_in?: string;
          check_out?: string | null;
          date?: string;
          created_at?: string;
          updated_at?: string;
          attendance_date?: string | null;
          check_in_time?: string | null;
          check_out_time?: string | null;
        };
      };
      kpi_targets: {
        Row: {
          id: string;
          user_id: string | null;
          group_id: string | null;
          target_omzet: number;
          target_gross_commission: number;
          target_attendance_days: number;
          period_month: number;
          period_year: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          group_id?: string | null;
          target_omzet?: number;
          target_gross_commission?: number;
          target_attendance_days?: number;
          period_month: number;
          period_year: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          group_id?: string | null;
          target_omzet?: number;
          target_gross_commission?: number;
          target_attendance_days?: number;
          period_month?: number;
          period_year?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      sop_documents: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          file_url: string | null;
          link_url: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          file_url?: string | null;
          link_url?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          file_url?: string | null;
          link_url?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          transaction_type: TransactionType;
          category: string;
          expense_category: CostCategory | null;
          amount: number;
          description: string;
          transaction_date: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          transaction_type: TransactionType;
          category: string;
          expense_category?: CostCategory | null;
          amount: number;
          description: string;
          transaction_date?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          transaction_type?: TransactionType;
          category?: string;
          expense_category?: CostCategory | null;
          amount?: number;
          description?: string;
          transaction_date?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_trail: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          old_values: any | null;
          new_values: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          old_values?: any | null;
          new_values?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          old_values?: any | null;
          new_values?: any | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      user_position: UserPosition;
      platform_type: PlatformType;
      account_status: AccountStatus;
      data_status: DataStatus;
      shift_type: ShiftType;
      product_category: ProductCategory;
      live_status: LiveStatus;
      period_week: PeriodWeek;
      transaction_type: TransactionType;
      cost_category: CostCategory;
      debt_type: DebtType;
      payment_status: PaymentStatus;
      file_type: FileType;
      audit_action: AuditAction;
    };
  };
}