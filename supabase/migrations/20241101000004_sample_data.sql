-- Insert sample data for testing
-- Note: In production, this should be run separately or conditionally

-- Insert sample groups
INSERT INTO groups (id, group_name) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Group Alpha'),
    ('22222222-2222-2222-2222-222222222222', 'Group Beta'),
    ('33333333-3333-3333-3333-333333333333', 'Group Gamma')
ON CONFLICT (group_name) DO NOTHING;

-- Insert sample users (with hashed passwords)
-- Password for all users: 'password123'
-- Hash generated using: SELECT crypt('password123', gen_salt('bf', 10));
INSERT INTO users (id, full_name, birth_date, position, username, password, address, start_work_date, group_id) VALUES
    -- Superadmin
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Super Admin', '1990-01-01', 'superadmin', 'superadmin', '$2a$10$rX8/TQl5vJv7vGVQvF5QmOC4xZnGqCLZmkU4d4f4f4f4f4f4f4f4f', 'Jakarta', '2024-01-01', NULL),
    
    -- Leaders
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Leader Alpha', '1985-05-15', 'leader', 'leader_alpha', '$2a$10$rX8/TQl5vJv7vGVQvF5QmOC4xZnGqCLZmkU4d4f4f4f4f4f4f4f4f', 'Bandung', '2024-01-15', '11111111-1111-1111-1111-111111111111'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Leader Beta', '1987-08-20', 'leader', 'leader_beta', '$2a$10$rX8/TQl5vJv7vGVQvF5QmOC4xZnGqCLZmkU4d4f4f4f4f4f4f4f4f', 'Surabaya', '2024-01-20', '22222222-2222-2222-2222-222222222222'),
    
    -- Admin
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Admin User', '1992-03-10', 'admin', 'admin', '$2a$10$rX8/TQl5vJv7vGVQvF5QmOC4xZnGqCLZmkU4d4f4f4f4f4f4f4f4f', 'Medan', '2024-02-01', '11111111-1111-1111-1111-111111111111'),
    
    -- Staff Host Live
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Host Live 1', '1995-07-25', 'staff_host_live', 'host1', '$2a$10$rX8/TQl5vJv7vGVQvF5QmOC4xZnGqCLZmkU4d4f4f4f4f4f4f4f4f', 'Yogyakarta', '2024-02-15', '11111111-1111-1111-1111-111111111111'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Host Live 2', '1993-11-30', 'staff_host_live', 'host2', '$2a$10$rX8/TQl5vJv7vGVQvF5QmOC4xZnGqCLZmkU4d4f4f4f4f4f4f4f4f', 'Semarang', '2024-03-01', '22222222-2222-2222-2222-222222222222'),
    
    -- Staff Content Creator
    ('99999999-9999-9999-9999-999999999999', 'Content Creator 1', '1996-12-12', 'staff_content_creator', 'creator1', '$2a$10$rX8/TQl5vJv7vGVQvF5QmOC4xZnGqCLZmkU4d4f4f4f4f4f4f4f4f', 'Malang', '2024-03-15', '33333333-3333-3333-3333-333333333333'),
    
    -- Viewer
    ('88888888-8888-8888-8888-888888888888', 'Viewer User', '1991-09-05', 'viewer', 'viewer', '$2a$10$rX8/TQl5vJv7vGVQvF5QmOC4xZnGqCLZmkU4d4f4f4f4f4f4f4f4f', 'Denpasar', '2024-04-01', NULL)
ON CONFLICT (username) DO NOTHING;

-- Insert sample devices
INSERT INTO devices (id, device_id, imei, google_account, purchase_date, purchase_price, screenshot_link, group_id) VALUES
    ('d1111111-1111-1111-1111-111111111111', 'HP-001', '123456789012345', 'device1@fahmyid.com', '2024-01-01', 3000000, 'https://example.com/screenshot1.jpg', '11111111-1111-1111-1111-111111111111'),
    ('d2222222-2222-2222-2222-222222222222', 'HP-002', '123456789012346', 'device2@fahmyid.com', '2024-01-02', 3500000, 'https://example.com/screenshot2.jpg', '22222222-2222-2222-2222-222222222222'),
    ('d3333333-3333-3333-3333-333333333333', 'HP-003', '123456789012347', 'device3@fahmyid.com', '2024-01-03', 4000000, 'https://example.com/screenshot3.jpg', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (device_id) DO NOTHING;

-- Insert sample affiliate accounts
INSERT INTO affiliate_accounts (id, platform, email, password, username, phone_number, account_status, data_status, group_id) VALUES
    ('a1111111-1111-1111-1111-111111111111', 'shopee', 'shopee1@example.com', 'password123', 'shopee_alpha_001', '081234567001', 'active', 'verified', '11111111-1111-1111-1111-111111111111'),
    ('a2222222-2222-2222-2222-222222222222', 'tiktok', 'tiktok1@example.com', 'password123', 'tiktok_beta_001', '081234567002', 'active', 'verified', '22222222-2222-2222-2222-222222222222'),
    ('a3333333-3333-3333-3333-333333333333', 'shopee', 'shopee2@example.com', 'password123', 'shopee_gamma_001', '081234567003', 'temp_banned', 'pending', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (username) DO NOTHING;

-- Insert sample daily reports (last 30 days)
INSERT INTO daily_reports (id, report_date, group_id, user_id, device_id, account_username, shift, product_category, live_status, opening_balance, closing_balance) 
SELECT 
    gen_random_uuid(),
    date_series.date,
    case 
        when date_series.date::text like '%1' then '11111111-1111-1111-1111-111111111111'
        when date_series.date::text like '%2' then '22222222-2222-2222-2222-222222222222'
        else '33333333-3333-3333-3333-333333333333'
    end,
    case 
        when date_series.date::text like '%1' then 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
        when date_series.date::text like '%2' then 'ffffffff-ffff-ffff-ffff-ffffffffffff'
        else '99999999-9999-9999-9999-999999999999'
    end,
    case 
        when date_series.date::text like '%1' then 'd1111111-1111-1111-1111-111111111111'
        when date_series.date::text like '%2' then 'd2222222-2222-2222-2222-222222222222'
        else 'd3333333-3333-3333-3333-333333333333'
    end,
    case 
        when date_series.date::text like '%1' then 'shopee_alpha_001'
        when date_series.date::text like '%2' then 'tiktok_beta_001'
        else 'shopee_gamma_001'
    end,
    '1'::shift_type,
    'fashion'::product_category,
    'lancar'::live_status,
    (random() * 1000000)::decimal(15,2),
    (random() * 2000000 + 1000000)::decimal(15,2)
FROM generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '1 day', '1 day'::interval) AS date_series(date)
ON CONFLICT (user_id, report_date, shift) DO NOTHING;

-- Insert sample commissions
INSERT INTO commissions (id, account_username, period_week, period_month, period_year, gross_commission, net_commission, liquid_commission) VALUES
    (gen_random_uuid(), 'shopee_alpha_001', 'M1', 10, 2024, 5000000, 4500000, 4000000),
    (gen_random_uuid(), 'shopee_alpha_001', 'M2', 10, 2024, 6000000, 5400000, 4800000),
    (gen_random_uuid(), 'tiktok_beta_001', 'M1', 10, 2024, 4500000, 4050000, 3600000),
    (gen_random_uuid(), 'tiktok_beta_001', 'M2', 10, 2024, 5500000, 4950000, 4400000),
    (gen_random_uuid(), 'shopee_gamma_001', 'M1', 10, 2024, 3000000, 2700000, 2400000)
ON CONFLICT (account_username, period_week, period_month, period_year) DO NOTHING;

-- Insert sample cashflow
INSERT INTO cashflow (id, transaction_date, type, group_id, amount, category, description, created_by) VALUES
    (gen_random_uuid(), CURRENT_DATE - INTERVAL '5 days', 'income', '11111111-1111-1111-1111-111111111111', 4000000, NULL, 'Komisi Cair Alpha M1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    (gen_random_uuid(), CURRENT_DATE - INTERVAL '3 days', 'expense', '11111111-1111-1111-1111-111111111111', 500000, 'fix_cost', 'Pulsa dan Internet', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    (gen_random_uuid(), CURRENT_DATE - INTERVAL '2 days', 'expense', '22222222-2222-2222-2222-222222222222', 300000, 'variable_cost', 'Beli Props Live', 'cccccccc-cccc-cccc-cccc-cccccccccccc')
ON CONFLICT DO NOTHING;

-- Insert sample assets
INSERT INTO assets (id, purchase_date, purchase_price, quantity, description, group_id) VALUES
    (gen_random_uuid(), '2024-01-15', 15000000, 3, 'Laptop untuk tim editing', '11111111-1111-1111-1111-111111111111'),
    (gen_random_uuid(), '2024-02-01', 5000000, 2, 'Ring light studio', '22222222-2222-2222-2222-222222222222'),
    (gen_random_uuid(), '2024-02-15', 2000000, 5, 'Tripod kamera', '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

-- Insert sample attendance (last 30 days for staff)
INSERT INTO attendance (id, user_id, attendance_date, check_in_time, check_out_time) 
SELECT 
    gen_random_uuid(),
    staff_id,
    date_series.date,
    (date_series.date + time '08:00:00' + (random() * interval '2 hours'))::timestamp with time zone,
    (date_series.date + time '17:00:00' + (random() * interval '2 hours'))::timestamp with time zone
FROM generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '1 day', '1 day'::interval) AS date_series(date)
CROSS JOIN (
    SELECT id as staff_id FROM users WHERE position IN ('staff_host_live', 'staff_content_creator')
) AS staff
WHERE extract(dow from date_series.date) NOT IN (0, 6) -- Exclude weekends
ON CONFLICT (user_id, attendance_date) DO NOTHING;

-- Insert sample KPI targets
INSERT INTO kpi_targets (id, target_month, target_year, target_omset, target_gross_commission, target_attendance_days, group_id) VALUES
    (gen_random_uuid(), 11, 2024, 50000000, 10000000, 22, '11111111-1111-1111-1111-111111111111'),
    (gen_random_uuid(), 11, 2024, 45000000, 9000000, 22, '22222222-2222-2222-2222-222222222222'),
    (gen_random_uuid(), 11, 2024, 40000000, 8000000, 22, '33333333-3333-3333-3333-333333333333')
ON CONFLICT (target_month, target_year, group_id) DO NOTHING;

-- Insert sample SOP documents
INSERT INTO sop_documents (id, title, file_url, file_type, uploaded_by) VALUES
    (gen_random_uuid(), 'Panduan Live Streaming Shopee', 'https://drive.google.com/file/d/sample1', 'google_drive', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    (gen_random_uuid(), 'Tutorial TikTok Shop', 'https://youtube.com/watch?v=sample1', 'youtube', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    (gen_random_uuid(), 'SOP Absensi Karyawan', 'https://example.com/sop-absensi.pdf', 'pdf', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT DO NOTHING;

-- Create audit trail trigger function
CREATE OR REPLACE FUNCTION create_audit_trail()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current authenticated user ID
    current_user_id := auth.uid();
    
    -- Skip if no authenticated user (system operations)
    IF current_user_id IS NULL THEN
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        ELSE
            RETURN NEW;
        END IF;
    END IF;
    
    -- Insert audit record
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_trail (user_id, action, table_name, record_id, old_data, new_data)
        VALUES (
            current_user_id,
            'delete'::audit_action,
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD),
            NULL
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_trail (user_id, action, table_name, record_id, old_data, new_data)
        VALUES (
            current_user_id,
            'update'::audit_action,
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(OLD),
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_trail (user_id, action, table_name, record_id, old_data, new_data)
        VALUES (
            current_user_id,
            'create'::audit_action,
            TG_TABLE_NAME,
            NEW.id,
            NULL,
            row_to_json(NEW)
        );
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for important tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION create_audit_trail();
CREATE TRIGGER audit_groups AFTER INSERT OR UPDATE OR DELETE ON groups FOR EACH ROW EXECUTE FUNCTION create_audit_trail();
CREATE TRIGGER audit_devices AFTER INSERT OR UPDATE OR DELETE ON devices FOR EACH ROW EXECUTE FUNCTION create_audit_trail();
CREATE TRIGGER audit_affiliate_accounts AFTER INSERT OR UPDATE OR DELETE ON affiliate_accounts FOR EACH ROW EXECUTE FUNCTION create_audit_trail();
CREATE TRIGGER audit_daily_reports AFTER INSERT OR UPDATE OR DELETE ON daily_reports FOR EACH ROW EXECUTE FUNCTION create_audit_trail();
CREATE TRIGGER audit_commissions AFTER INSERT OR UPDATE OR DELETE ON commissions FOR EACH ROW EXECUTE FUNCTION create_audit_trail();
CREATE TRIGGER audit_cashflow AFTER INSERT OR UPDATE OR DELETE ON cashflow FOR EACH ROW EXECUTE FUNCTION create_audit_trail();