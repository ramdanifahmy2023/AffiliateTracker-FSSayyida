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
      groups: {
        Row: {
          id: string;
          group_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          full_name: string;
          birth_date: string;
          position: UserPosition;
          username: string;
          password: string;
          address: string;
          start_work_date: string;
          group_id: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          birth_date: string;
          position: UserPosition;
          username: string;
          password: string;
          address: string;
          start_work_date: string;
          group_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          birth_date?: string;
          position?: UserPosition;
          username?: string;
          password?: string;
          address?: string;
          start_work_date?: string;
          group_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      devices: {
        Row: {
          id: string;
          device_id: string;
          imei: string;
          google_account: string;
          purchase_date: string;
          purchase_price: number;
          screenshot_link: string;
          group_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          imei: string;
          google_account: string;
          purchase_date: string;
          purchase_price: number;
          screenshot_link: string;
          group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          device_id?: string;
          imei?: string;
          google_account?: string;
          purchase_date?: string;
          purchase_price?: number;
          screenshot_link?: string;
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
          phone_number: string;
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
          phone_number: string;
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
          phone_number?: string;
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
          report_date: string;
          group_id: string;
          user_id: string;
          device_id: string;
          account_username: string;
          shift: ShiftType;
          product_category: ProductCategory;
          live_status: LiveStatus;
          opening_balance: number;
          closing_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          report_date: string;
          group_id: string;
          user_id: string;
          device_id: string;
          account_username: string;
          shift: ShiftType;
          product_category: ProductCategory;
          live_status: LiveStatus;
          opening_balance?: number;
          closing_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          report_date?: string;
          group_id?: string;
          user_id?: string;
          device_id?: string;
          account_username?: string;
          shift?: ShiftType;
          product_category?: ProductCategory;
          live_status?: LiveStatus;
          opening_balance?: number;
          closing_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      commissions: {
        Row: {
          id: string;
          account_username: string;
          period_week: PeriodWeek;
          period_month: number;
          period_year: number;
          gross_commission: number;
          net_commission: number;
          liquid_commission: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_username: string;
          period_week: PeriodWeek;
          period_month: number;
          period_year: number;
          gross_commission?: number;
          net_commission?: number;
          liquid_commission?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_username?: string;
          period_week?: PeriodWeek;
          period_month?: number;
          period_year?: number;
          gross_commission?: number;
          net_commission?: number;
          liquid_commission?: number;
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
          created_at: string;
          updated_at: string;
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
          created_at?: string;
          updated_at?: string;
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
          created_at?: string;
          updated_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          purchase_date: string;
          purchase_price: number;
          quantity: number;
          description: string;
          group_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          purchase_date: string;
          purchase_price: number;
          quantity?: number;
          description: string;
          group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          purchase_date?: string;
          purchase_price?: number;
          quantity?: number;
          description?: string;
          group_id?: string | null;
          created_at?: string;
          updated_at?: string;
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          transaction_date: string;
          type: DebtType;
          amount: number;
          description: string;
          status?: PaymentStatus;
          group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          transaction_date?: string;
          type?: DebtType;
          amount?: number;
          description?: string;
          status?: PaymentStatus;
          group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          user_id: string;
          attendance_date: string;
          check_in_time: string;
          check_out_time: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          attendance_date: string;
          check_in_time: string;
          check_out_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          attendance_date?: string;
          check_in_time?: string;
          check_out_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      kpi_targets: {
        Row: {
          id: string;
          target_month: number;
          target_year: number;
          target_omset: number;
          target_gross_commission: number;
          target_attendance_days: number;
          group_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          target_month: number;
          target_year: number;
          target_omset: number;
          target_gross_commission: number;
          target_attendance_days: number;
          group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          target_month?: number;
          target_year?: number;
          target_omset?: number;
          target_gross_commission?: number;
          target_attendance_days?: number;
          group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sop_documents: {
        Row: {
          id: string;
          title: string;
          file_url: string;
          file_type: FileType;
          uploaded_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          file_url: string;
          file_type: FileType;
          uploaded_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          file_url?: string;
          file_type?: FileType;
          uploaded_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_trail: {
        Row: {
          id: string;
          user_id: string;
          action: AuditAction;
          table_name: string;
          record_id: string;
          old_data: any;
          new_data: any;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: AuditAction;
          table_name: string;
          record_id: string;
          old_data?: any;
          new_data: any;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: AuditAction;
          table_name?: string;
          record_id?: string;
          old_data?: any;
          new_data?: any;
          timestamp?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_dashboard_stats: {
        Args: {
          p_start_date?: string;
          p_end_date?: string;
          p_group_ids?: string[];
          p_user_ids?: string[];
        };
        Returns: any;
      };
      calculate_kpi_progress: {
        Args: {
          p_group_id?: string;
          p_month?: number;
          p_year?: number;
        };
        Returns: any;
      };
      get_omset_chart_data: {
        Args: {
          p_start_date?: string;
          p_end_date?: string;
          p_group_ids?: string[];
          p_interval?: string;
        };
        Returns: any;
      };
      get_commission_chart_data: {
        Args: {
          p_start_date?: string;
          p_end_date?: string;
          p_group_ids?: string[];
        };
        Returns: any;
      };
      get_account_chart_data: {
        Args: {
          p_group_ids?: string[];
        };
        Returns: any;
      };
      get_group_performance_chart_data: {
        Args: {
          p_start_date?: string;
          p_end_date?: string;
        };
        Returns: any;
      };
    };
    Enums: {
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