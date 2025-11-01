import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart3, Users, DollarSign, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { supabase, calculatePercentageChange, formatCurrency } from '../../lib/supabase';
import { useEffect, useState } from 'react';

interface KPIValue {
  value: number;
  previous_value: number;
  percentage_change: number;
}

interface DashboardStats {
  kpi_cards: {
    total_gross_commission: KPIValue;
    total_net_commission: KPIValue;
    total_liquid_commission: KPIValue;
    total_expenses: KPIValue;
  };
  info_cards: {
    total_employees: number;
    total_groups: number;
  };
  total_omset: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_dashboard_stats');
      if (!error) {
        setStats(data as DashboardStats);
      }
      setLoading(false);
    };

    loadStats();
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Ringkasan performa bisnis Affiliate</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {['total_gross_commission','total_net_commission','total_liquid_commission','total_expenses'].map((key) => {
          const item = stats?.kpi_cards?.[key as keyof DashboardStats['kpi_cards']];
          const labelMap: Record<string, string> = {
            total_gross_commission: 'Komisi Kotor',
            total_net_commission: 'Komisi Bersih',
            total_liquid_commission: 'Komisi Cair',
            total_expenses: 'Pengeluaran'
          };
          const label = labelMap[key];
          
          const change = item ? calculatePercentageChange(item.value, item.previous_value) : null;
          const isExpense = key === 'total_expenses';

          return (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(item?.value || 0)}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {change ? (
                    <>
                      {change.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : change.trend === 'down' ? (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-gray-500" />
                      )}
                      <span>
                        {isExpense ? 'Perubahan pengeluaran ' : 'Perubahan komisi '}
                        {change.percentage}% dibanding periode sebelumnya
                      </span>
                    </>
                  ) : 'Memuat...'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Umum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-muted-foreground">Total Karyawan</div>
                <div className="text-2xl font-bold">{stats?.info_cards.total_employees ?? '-'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Grup</div>
                <div className="text-2xl font-bold">{stats?.info_cards.total_groups ?? '-'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Omset (bulan ini)</div>
                <div className="text-2xl font-bold">{formatCurrency(stats?.total_omset || 0)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
