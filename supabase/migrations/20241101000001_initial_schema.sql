-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_position AS ENUM (
    'superadmin', 
    'leader', 
    'admin', 
    'staff_host_live', 
    'staff_content_creator', 
    'viewer'
);

CREATE TYPE platform_type AS ENUM ('shopee', 'tiktok');
CREATE TYPE account_status AS ENUM ('active', 'temp_banned', 'perm_banned');
CREATE TYPE data_status AS ENUM ('empty', 'pending', 'rejected', 'verified');
CREATE TYPE shift_type AS ENUM ('1', '2', '3');
CREATE TYPE product_category AS ENUM (
    'fashion', 
    'elektronik', 
    'kecantikan', 
    'food', 
    'hobi', 
    'otomotif', 
    'lainnya'
);
CREATE TYPE live_status AS ENUM ('lancar', 'mati', 'relive');
CREATE TYPE period_week AS ENUM ('M1', 'M2', 'M3', 'M4', 'M5');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE cost_category AS ENUM ('fix_cost', 'variable_cost');
CREATE TYPE debt_type AS ENUM ('debt', 'receivable');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'cancelled');
CREATE TYPE file_type AS ENUM ('pdf', 'google_drive', 'youtube');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete');

-- 1. Groups table
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    position user_position NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    address TEXT NOT NULL,
    start_work_date DATE NOT NULL,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Devices table
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id TEXT UNIQUE NOT NULL,
    imei TEXT UNIQUE NOT NULL,
    google_account TEXT NOT NULL,
    purchase_date DATE NOT NULL,
    purchase_price DECIMAL(15,2) NOT NULL,
    screenshot_link TEXT NOT NULL,
    group_id UUID UNIQUE REFERENCES groups(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Affiliate accounts table
CREATE TABLE affiliate_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform platform_type NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    phone_number TEXT NOT NULL,
    account_status account_status NOT NULL DEFAULT 'active',
    data_status data_status NOT NULL DEFAULT 'empty',
    notes TEXT,
    group_id UUID UNIQUE REFERENCES groups(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Daily reports table
CREATE TABLE daily_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_date DATE NOT NULL,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    account_username TEXT NOT NULL REFERENCES affiliate_accounts(username) ON DELETE CASCADE,
    shift shift_type NOT NULL,
    product_category product_category NOT NULL,
    live_status live_status NOT NULL,
    opening_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    closing_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, report_date, shift)
);

-- 6. Commissions table
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_username TEXT NOT NULL REFERENCES affiliate_accounts(username) ON DELETE CASCADE,
    period_week period_week NOT NULL,
    period_month INTEGER NOT NULL CHECK (period_month >= 1 AND period_month <= 12),
    period_year INTEGER NOT NULL CHECK (period_year >= 2020),
    gross_commission DECIMAL(15,2) NOT NULL DEFAULT 0,
    net_commission DECIMAL(15,2) NOT NULL DEFAULT 0,
    liquid_commission DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(account_username, period_week, period_month, period_year)
);

-- 7. Cashflow table
CREATE TABLE cashflow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_date DATE NOT NULL,
    type transaction_type NOT NULL,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    amount DECIMAL(15,2) NOT NULL,
    proof_link TEXT,
    category cost_category,
    description TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Assets table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_date DATE NOT NULL,
    purchase_price DECIMAL(15,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    description TEXT NOT NULL,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Debt receivables table
CREATE TABLE debt_receivables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_date DATE NOT NULL,
    type debt_type NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Attendance table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, attendance_date)
);

-- 11. KPI targets table
CREATE TABLE kpi_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_month INTEGER NOT NULL CHECK (target_month >= 1 AND target_month <= 12),
    target_year INTEGER NOT NULL CHECK (target_year >= 2020),
    target_omset DECIMAL(15,2) NOT NULL,
    target_gross_commission DECIMAL(15,2) NOT NULL,
    target_attendance_days INTEGER NOT NULL CHECK (target_attendance_days >= 1 AND target_attendance_days <= 31),
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(target_month, target_year, group_id)
);

-- 12. SOP documents table
CREATE TABLE sop_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type file_type NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Audit trail table
CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action audit_action NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_daily_reports_date ON daily_reports(report_date);
CREATE INDEX idx_daily_reports_group ON daily_reports(group_id);
CREATE INDEX idx_daily_reports_user ON daily_reports(user_id);
CREATE INDEX idx_commissions_period ON commissions(period_month, period_year);
CREATE INDEX idx_attendance_user_date ON attendance(user_id, attendance_date);
CREATE INDEX idx_cashflow_date ON cashflow(transaction_date);
CREATE INDEX idx_audit_trail_user ON audit_trail(user_id);
CREATE INDEX idx_audit_trail_table ON audit_trail(table_name);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_position ON users(position);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_accounts_updated_at BEFORE UPDATE ON affiliate_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON daily_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cashflow_updated_at BEFORE UPDATE ON cashflow FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_debt_receivables_updated_at BEFORE UPDATE ON debt_receivables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kpi_targets_updated_at BEFORE UPDATE ON kpi_targets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sop_documents_updated_at BEFORE UPDATE ON sop_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();