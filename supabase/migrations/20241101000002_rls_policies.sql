-- Enable Row Level Security on all tables
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's position
CREATE OR REPLACE FUNCTION get_user_position(user_id UUID)
RETURNS user_position AS $$
BEGIN
    RETURN (SELECT position FROM users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's group_id
CREATE OR REPLACE FUNCTION get_user_group_id(user_id UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT group_id FROM users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is superadmin or leader
CREATE OR REPLACE FUNCTION is_admin_or_leader(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id 
        AND position IN ('superadmin', 'leader')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================
-- GROUPS TABLE POLICIES
-- ======================

-- Superadmin and Leader can do everything
CREATE POLICY "groups_superadmin_leader_all" ON groups
FOR ALL
USING (is_admin_or_leader(auth.uid()));

-- Admin and Viewer can only read
CREATE POLICY "groups_admin_viewer_read" ON groups
FOR SELECT
USING (
    get_user_position(auth.uid()) IN ('admin', 'viewer')
);

-- ======================
-- USERS TABLE POLICIES
-- ======================

-- Users can view their own profile
CREATE POLICY "users_own_profile" ON users
FOR SELECT
USING (auth.uid() = id);

-- Superadmin can do everything
CREATE POLICY "users_superadmin_all" ON users
FOR ALL
USING (get_user_position(auth.uid()) = 'superadmin');

-- Leader can CRUD but not delete
CREATE POLICY "users_leader_crud" ON users
FOR ALL
USING (
    get_user_position(auth.uid()) = 'leader'
    AND NOT (TG_OP = 'DELETE')
);

-- Admin and Viewer can only read
CREATE POLICY "users_others_read" ON users
FOR SELECT
USING (
    get_user_position(auth.uid()) IN ('admin', 'viewer')
);

-- ======================
-- DEVICES TABLE POLICIES
-- ======================

-- Superadmin and Leader can do everything
CREATE POLICY "devices_superadmin_leader_all" ON devices
FOR ALL
USING (is_admin_or_leader(auth.uid()));

-- Admin and Viewer can only read
CREATE POLICY "devices_admin_viewer_read" ON devices
FOR SELECT
USING (
    get_user_position(auth.uid()) IN ('admin', 'viewer')
);

-- ======================
-- AFFILIATE_ACCOUNTS TABLE POLICIES
-- ======================

-- Superadmin and Leader can do everything
CREATE POLICY "affiliate_accounts_superadmin_leader_all" ON affiliate_accounts
FOR ALL
USING (is_admin_or_leader(auth.uid()));

-- Admin and Viewer can only read
CREATE POLICY "affiliate_accounts_admin_viewer_read" ON affiliate_accounts
FOR SELECT
USING (
    get_user_position(auth.uid()) IN ('admin', 'viewer')
);

-- ======================
-- DAILY_REPORTS TABLE POLICIES
-- ======================

-- Staff can only create, read, update their own reports (no delete)
CREATE POLICY "daily_reports_staff_own" ON daily_reports
FOR ALL
USING (
    get_user_position(auth.uid()) IN ('staff_host_live', 'staff_content_creator')
    AND user_id = auth.uid()
    AND NOT (TG_OP = 'DELETE')
);

-- Superadmin, Leader, Admin can read all
CREATE POLICY "daily_reports_admin_read_all" ON daily_reports
FOR SELECT
USING (
    get_user_position(auth.uid()) IN ('superadmin', 'leader', 'admin', 'viewer')
);

-- Superadmin and Leader can do everything
CREATE POLICY "daily_reports_superadmin_leader_all" ON daily_reports
FOR ALL
USING (is_admin_or_leader(auth.uid()));

-- ======================
-- COMMISSIONS TABLE POLICIES
-- ======================

-- Superadmin and Leader can do everything
CREATE POLICY "commissions_superadmin_leader_all" ON commissions
FOR ALL
USING (is_admin_or_leader(auth.uid()));

-- Admin and Viewer can only read
CREATE POLICY "commissions_admin_viewer_read" ON commissions
FOR SELECT
USING (
    get_user_position(auth.uid()) IN ('admin', 'viewer')
);

-- ======================
-- CASHFLOW TABLE POLICIES
-- ======================

-- Superadmin can do everything
CREATE POLICY "cashflow_superadmin_all" ON cashflow
FOR ALL
USING (get_user_position(auth.uid()) = 'superadmin');

-- Leader and Admin can create and read
CREATE POLICY "cashflow_leader_admin_cr" ON cashflow
FOR ALL
USING (
    get_user_position(auth.uid()) IN ('leader', 'admin')
    AND NOT (TG_OP = 'DELETE')
);

-- Viewer can only read
CREATE POLICY "cashflow_viewer_read" ON cashflow
FOR SELECT
USING (
    get_user_position(auth.uid()) = 'viewer'
);

-- ======================
-- ASSETS TABLE POLICIES
-- ======================

-- Superadmin can do everything
CREATE POLICY "assets_superadmin_all" ON assets
FOR ALL
USING (get_user_position(auth.uid()) = 'superadmin');

-- Leader can only read
CREATE POLICY "assets_leader_read" ON assets
FOR SELECT
USING (get_user_position(auth.uid()) = 'leader');

-- Admin can create, read, update, delete
CREATE POLICY "assets_admin_crud" ON assets
FOR ALL
USING (get_user_position(auth.uid()) = 'admin');

-- Viewer can only read
CREATE POLICY "assets_viewer_read" ON assets
FOR SELECT
USING (get_user_position(auth.uid()) = 'viewer');

-- ======================
-- DEBT_RECEIVABLES TABLE POLICIES
-- ======================

-- Superadmin can do everything
CREATE POLICY "debt_receivables_superadmin_all" ON debt_receivables
FOR ALL
USING (get_user_position(auth.uid()) = 'superadmin');

-- Leader and Admin can create and read
CREATE POLICY "debt_receivables_leader_admin_cr" ON debt_receivables
FOR ALL
USING (
    get_user_position(auth.uid()) IN ('leader', 'admin')
    AND NOT (TG_OP = 'DELETE')
);

-- Viewer can only read
CREATE POLICY "debt_receivables_viewer_read" ON debt_receivables
FOR SELECT
USING (get_user_position(auth.uid()) = 'viewer');

-- ======================
-- ATTENDANCE TABLE POLICIES
-- ======================

-- Staff can only create their own attendance (check-in)
CREATE POLICY "attendance_staff_own_create" ON attendance
FOR INSERT
USING (
    get_user_position(auth.uid()) IN ('staff_host_live', 'staff_content_creator')
    AND user_id = auth.uid()
);

-- Staff can read their own attendance
CREATE POLICY "attendance_staff_own_read" ON attendance
FOR SELECT
USING (
    get_user_position(auth.uid()) IN ('staff_host_live', 'staff_content_creator')
    AND user_id = auth.uid()
);

-- System can update attendance (for auto check-out)
CREATE POLICY "attendance_system_update" ON attendance
FOR UPDATE
USING (true); -- Will be restricted by application logic

-- All other roles can read attendance data
CREATE POLICY "attendance_others_read" ON attendance
FOR SELECT
USING (
    get_user_position(auth.uid()) IN ('superadmin', 'leader', 'admin', 'viewer')
);

-- ======================
-- KPI_TARGETS TABLE POLICIES
-- ======================

-- Superadmin and Leader can do everything
CREATE POLICY "kpi_targets_superadmin_leader_all" ON kpi_targets
FOR ALL
USING (is_admin_or_leader(auth.uid()));

-- Admin and Viewer can only read
CREATE POLICY "kpi_targets_admin_viewer_read" ON kpi_targets
FOR SELECT
USING (
    get_user_position(auth.uid()) IN ('admin', 'viewer')
);

-- ======================
-- SOP_DOCUMENTS TABLE POLICIES
-- ======================

-- All authenticated users can read SOP documents
CREATE POLICY "sop_documents_all_read" ON sop_documents
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Superadmin and Leader can do everything
CREATE POLICY "sop_documents_superadmin_leader_all" ON sop_documents
FOR ALL
USING (is_admin_or_leader(auth.uid()));

-- ======================
-- AUDIT_TRAIL TABLE POLICIES
-- ======================

-- Only Superadmin can read audit trail
CREATE POLICY "audit_trail_superadmin_read" ON audit_trail
FOR SELECT
USING (get_user_position(auth.uid()) = 'superadmin');

-- System can insert audit records
CREATE POLICY "audit_trail_system_insert" ON audit_trail
FOR INSERT
USING (true); -- Will be restricted by application logic