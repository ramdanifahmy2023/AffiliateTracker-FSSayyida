-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_group_ids UUID[] DEFAULT NULL,
    p_user_ids UUID[] DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    start_date DATE;
    end_date DATE;
    prev_start_date DATE;
    prev_end_date DATE;
BEGIN
    -- Set default dates if not provided
    start_date := COALESCE(p_start_date, date_trunc('month', CURRENT_DATE)::DATE);
    end_date := COALESCE(p_end_date, CURRENT_DATE);
    
    -- Calculate previous period for comparison
    prev_start_date := start_date - (end_date - start_date + 1);
    prev_end_date := start_date - 1;
    
    WITH current_stats AS (
        -- Current period statistics
        SELECT
            COALESCE(SUM(c.gross_commission), 0) as total_gross_commission,
            COALESCE(SUM(c.net_commission), 0) as total_net_commission,
            COALESCE(SUM(c.liquid_commission), 0) as total_liquid_commission,
            COALESCE(SUM(CASE WHEN cf.type = 'expense' THEN cf.amount ELSE 0 END), 0) as total_expenses,
            COALESCE(SUM(dr.closing_balance - dr.opening_balance), 0) as total_omset,
            COUNT(DISTINCT u.id) as total_employees,
            COUNT(DISTINCT g.id) as total_groups
        FROM users u
        LEFT JOIN groups g ON u.group_id = g.id
        LEFT JOIN daily_reports dr ON u.id = dr.user_id 
            AND dr.report_date BETWEEN start_date AND end_date
        LEFT JOIN affiliate_accounts aa ON aa.group_id = g.id
        LEFT JOIN commissions c ON aa.username = c.account_username
            AND DATE(c.created_at) BETWEEN start_date AND end_date
        LEFT JOIN cashflow cf ON cf.group_id = g.id
            AND cf.transaction_date BETWEEN start_date AND end_date
        WHERE (p_group_ids IS NULL OR g.id = ANY(p_group_ids))
            AND (p_user_ids IS NULL OR u.id = ANY(p_user_ids))
    ),
    previous_stats AS (
        -- Previous period statistics for comparison
        SELECT
            COALESCE(SUM(c.gross_commission), 0) as prev_gross_commission,
            COALESCE(SUM(c.net_commission), 0) as prev_net_commission,
            COALESCE(SUM(c.liquid_commission), 0) as prev_liquid_commission,
            COALESCE(SUM(CASE WHEN cf.type = 'expense' THEN cf.amount ELSE 0 END), 0) as prev_expenses
        FROM users u
        LEFT JOIN groups g ON u.group_id = g.id
        LEFT JOIN daily_reports dr ON u.id = dr.user_id 
            AND dr.report_date BETWEEN prev_start_date AND prev_end_date
        LEFT JOIN affiliate_accounts aa ON aa.group_id = g.id
        LEFT JOIN commissions c ON aa.username = c.account_username
            AND DATE(c.created_at) BETWEEN prev_start_date AND prev_end_date
        LEFT JOIN cashflow cf ON cf.group_id = g.id
            AND cf.transaction_date BETWEEN prev_start_date AND prev_end_date
        WHERE (p_group_ids IS NULL OR g.id = ANY(p_group_ids))
            AND (p_user_ids IS NULL OR u.id = ANY(p_user_ids))
    )
    SELECT json_build_object(
        'kpi_cards', json_build_object(
            'total_gross_commission', json_build_object(
                'value', cs.total_gross_commission,
                'previous_value', ps.prev_gross_commission,
                'percentage_change', CASE 
                    WHEN ps.prev_gross_commission = 0 THEN 100
                    ELSE ROUND(((cs.total_gross_commission - ps.prev_gross_commission) / ps.prev_gross_commission * 100)::numeric, 2)
                END
            ),
            'total_net_commission', json_build_object(
                'value', cs.total_net_commission,
                'previous_value', ps.prev_net_commission,
                'percentage_change', CASE 
                    WHEN ps.prev_net_commission = 0 THEN 100
                    ELSE ROUND(((cs.total_net_commission - ps.prev_net_commission) / ps.prev_net_commission * 100)::numeric, 2)
                END
            ),
            'total_liquid_commission', json_build_object(
                'value', cs.total_liquid_commission,
                'previous_value', ps.prev_liquid_commission,
                'percentage_change', CASE 
                    WHEN ps.prev_liquid_commission = 0 THEN 100
                    ELSE ROUND(((cs.total_liquid_commission - ps.prev_liquid_commission) / ps.prev_liquid_commission * 100)::numeric, 2)
                END
            ),
            'total_expenses', json_build_object(
                'value', cs.total_expenses,
                'previous_value', ps.prev_expenses,
                'percentage_change', CASE 
                    WHEN ps.prev_expenses = 0 THEN 100
                    ELSE ROUND(((cs.total_expenses - ps.prev_expenses) / ps.prev_expenses * 100)::numeric, 2)
                END
            )
        ),
        'info_cards', json_build_object(
            'total_employees', cs.total_employees,
            'total_groups', cs.total_groups
        ),
        'total_omset', cs.total_omset
    ) INTO result
    FROM current_stats cs, previous_stats ps;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate KPI progress for a group
CREATE OR REPLACE FUNCTION calculate_kpi_progress(
    p_group_id UUID DEFAULT NULL,
    p_month INTEGER DEFAULT NULL,
    p_year INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    target_month INTEGER;
    target_year INTEGER;
    target_record RECORD;
BEGIN
    -- Set default month/year if not provided
    target_month := COALESCE(p_month, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER);
    target_year := COALESCE(p_year, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);
    
    -- Get target data
    SELECT * INTO target_record
    FROM kpi_targets kt
    WHERE kt.target_month = target_month
        AND kt.target_year = target_year
        AND (p_group_id IS NULL OR kt.group_id = p_group_id)
    LIMIT 1;
    
    -- If no target found, return empty result
    IF target_record IS NULL THEN
        RETURN json_build_object(
            'has_target', false,
            'message', 'No KPI target set for this period'
        );
    END IF;
    
    WITH kpi_realization AS (
        SELECT
            -- Omset realization
            COALESCE(SUM(dr.closing_balance - dr.opening_balance), 0) as realized_omset,
            
            -- Commission realization  
            COALESCE(SUM(c.gross_commission), 0) as realized_commission,
            
            -- Attendance realization (average per employee)
            COALESCE(
                COUNT(DISTINCT CONCAT(a.user_id::text, a.attendance_date::text)) / 
                NULLIF(COUNT(DISTINCT u.id), 0), 
                0
            ) as avg_attendance_per_employee
            
        FROM users u
        LEFT JOIN groups g ON u.group_id = g.id
        LEFT JOIN daily_reports dr ON u.id = dr.user_id 
            AND EXTRACT(MONTH FROM dr.report_date) = target_month
            AND EXTRACT(YEAR FROM dr.report_date) = target_year
        LEFT JOIN affiliate_accounts aa ON aa.group_id = g.id
        LEFT JOIN commissions c ON aa.username = c.account_username
            AND c.period_month = target_month
            AND c.period_year = target_year
        LEFT JOIN attendance a ON u.id = a.user_id
            AND EXTRACT(MONTH FROM a.attendance_date) = target_month
            AND EXTRACT(YEAR FROM a.attendance_date) = target_year
        WHERE (p_group_id IS NULL OR g.id = p_group_id)
    )
    SELECT json_build_object(
        'has_target', true,
        'group_id', target_record.group_id,
        'period', json_build_object(
            'month', target_month,
            'year', target_year
        ),
        'targets', json_build_object(
            'omset', target_record.target_omset,
            'commission', target_record.target_gross_commission,
            'attendance', target_record.target_attendance_days
        ),
        'realization', json_build_object(
            'omset', kr.realized_omset,
            'commission', kr.realized_commission,
            'attendance', kr.avg_attendance_per_employee
        ),
        'percentage', json_build_object(
            'omset', ROUND((kr.realized_omset / NULLIF(target_record.target_omset, 0) * 100)::numeric, 2),
            'commission', ROUND((kr.realized_commission / NULLIF(target_record.target_gross_commission, 0) * 100)::numeric, 2),
            'attendance', ROUND((kr.avg_attendance_per_employee / NULLIF(target_record.target_attendance_days, 0) * 100)::numeric, 2)
        ),
        'overall_kpi', ROUND((
            (kr.realized_omset / NULLIF(target_record.target_omset, 0) * 100) +
            (kr.realized_commission / NULLIF(target_record.target_gross_commission, 0) * 100) +
            (kr.avg_attendance_per_employee / NULLIF(target_record.target_attendance_days, 0) * 100)
        ) / 3::numeric, 2)
    ) INTO result
    FROM kpi_realization kr;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get chart data for omset trend
CREATE OR REPLACE FUNCTION get_omset_chart_data(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_group_ids UUID[] DEFAULT NULL,
    p_interval TEXT DEFAULT 'day'
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    start_date DATE;
    end_date DATE;
BEGIN
    start_date := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
    end_date := COALESCE(p_end_date, CURRENT_DATE);
    
    WITH date_series AS (
        SELECT generate_series(start_date, end_date, ('1 ' || p_interval)::interval)::date as date
    ),
    omset_data AS (
        SELECT 
            CASE 
                WHEN p_interval = 'week' THEN date_trunc('week', dr.report_date)::date
                WHEN p_interval = 'month' THEN date_trunc('month', dr.report_date)::date
                ELSE dr.report_date
            END as period_date,
            SUM(dr.closing_balance - dr.opening_balance) as omset
        FROM daily_reports dr
        JOIN users u ON dr.user_id = u.id
        JOIN groups g ON u.group_id = g.id
        WHERE dr.report_date BETWEEN start_date AND end_date
            AND (p_group_ids IS NULL OR g.id = ANY(p_group_ids))
        GROUP BY period_date
    )
    SELECT json_agg(
        json_build_object(
            'date', ds.date,
            'omset', COALESCE(od.omset, 0)
        ) ORDER BY ds.date
    ) INTO result
    FROM date_series ds
    LEFT JOIN omset_data od ON ds.date = od.period_date;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get commission chart data (multi-line)
CREATE OR REPLACE FUNCTION get_commission_chart_data(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_group_ids UUID[] DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    start_date DATE;
    end_date DATE;
BEGIN
    start_date := COALESCE(p_start_date, date_trunc('year', CURRENT_DATE));
    end_date := COALESCE(p_end_date, CURRENT_DATE);
    
    WITH commission_data AS (
        SELECT 
            c.period_week,
            c.period_month,
            c.period_year,
            SUM(c.gross_commission) as komisi_kotor,
            SUM(c.net_commission) as komisi_bersih,
            SUM(c.liquid_commission) as komisi_cair
        FROM commissions c
        JOIN affiliate_accounts aa ON c.account_username = aa.username
        JOIN groups g ON aa.group_id = g.id
        WHERE (p_group_ids IS NULL OR g.id = ANY(p_group_ids))
            AND DATE(c.created_at) BETWEEN start_date AND end_date
        GROUP BY c.period_week, c.period_month, c.period_year
        ORDER BY c.period_year, c.period_month, c.period_week
    )
    SELECT json_agg(
        json_build_object(
            'period', cd.period_week || ' - ' || cd.period_month || '/' || cd.period_year,
            'komisi_kotor', cd.komisi_kotor,
            'komisi_bersih', cd.komisi_bersih,
            'komisi_cair', cd.komisi_cair
        )
    ) INTO result
    FROM commission_data cd;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get account status breakdown for pie chart
CREATE OR REPLACE FUNCTION get_account_chart_data(
    p_group_ids UUID[] DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    WITH account_stats AS (
        SELECT 
            aa.platform,
            aa.account_status,
            COUNT(*) as count
        FROM affiliate_accounts aa
        JOIN groups g ON aa.group_id = g.id
        WHERE (p_group_ids IS NULL OR g.id = ANY(p_group_ids))
        GROUP BY aa.platform, aa.account_status
    )
    SELECT json_agg(
        json_build_object(
            'name', as.platform || ' - ' || as.account_status,
            'value', as.count
        )
    ) INTO result
    FROM account_stats as;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get group performance data for bar chart
CREATE OR REPLACE FUNCTION get_group_performance_chart_data(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    start_date DATE;
    end_date DATE;
BEGIN
    start_date := COALESCE(p_start_date, date_trunc('month', CURRENT_DATE));
    end_date := COALESCE(p_end_date, CURRENT_DATE);
    
    WITH group_performance AS (
        SELECT 
            g.group_name,
            SUM(dr.closing_balance - dr.opening_balance) as total_omset
        FROM groups g
        LEFT JOIN users u ON g.id = u.group_id
        LEFT JOIN daily_reports dr ON u.id = dr.user_id
            AND dr.report_date BETWEEN start_date AND end_date
        GROUP BY g.id, g.group_name
        ORDER BY total_omset DESC NULLS LAST
    )
    SELECT json_agg(
        json_build_object(
            'group_name', gp.group_name,
            'total_omset', COALESCE(gp.total_omset, 0)
        )
    ) INTO result
    FROM group_performance gp;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;