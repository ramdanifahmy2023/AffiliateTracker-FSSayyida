import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../../components/ui/chart';
import { supabase, formatCurrency, handleSupabaseError } from '../../lib/supabase';
import { Target, Plus, Edit, Trash, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { Database } from '../../types/database';

type KpiTarget = Database['public']['Tables']['kpi_targets']['Row'] & {
  group?: { group_name: string };
};

interface KpiFormData {
  target_month: number;
  target_year: number;
  target_omset: number;
  target_gross_commission: number;
  target_attendance_days: number;
  group_id: string;
}

interface KpiProgress {
  has_target: boolean;
  group_id?: string;
  period: {
    month: number;
    year: number;
  };
  targets: {
    omset: number;
    commission: number;
    attendance: number;
  };
  realization: {
    omset: number;
    commission: number;
    attendance: number;
  };
  percentage: {
    omset: number;
    commission: number;
    attendance: number;
  };
  overall_kpi: number;
}

export default function KpiTargets() {
  const { user } = useAuth();
  const [targets, setTargets] = useState<KpiTarget[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [kpiProgress, setKpiProgress] = useState<KpiProgress[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTarget, setEditingTarget] = useState<KpiTarget | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<KpiFormData>({
    target_month: new Date().getMonth() + 1,
    target_year: new Date().getFullYear(),
    target_omset: 0,
    target_gross_commission: 0,
    target_attendance_days: 22,
    group_id: user?.group_id || ''
  });

  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    loadTargets();
    loadGroups();
    loadKpiProgress();
  }, [selectedPeriod]);

  const loadTargets = async () => {
    let query = supabase
      .from('kpi_targets')
      .select(`
        *,
        group:group_id(
          group_name
        )
      `)
      .eq('target_month', selectedPeriod.month)
      .eq('target_year', selectedPeriod.year)
      .order('created_at', { ascending: false });

    // Role-based filtering
    if (user?.position !== 'superadmin' && user?.position !== 'leader') {
      if (user?.group_id) {
        query = query.eq('group_id', user.group_id);
      }
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Gagal memuat target KPI: ' + handleSupabaseError(error));
    } else {
      setTargets(data || []);
    }
  };

  const loadGroups = async () => {
    const { data } = await supabase
      .from('groups')
      .select('*')
      .order('group_name');
    
    setGroups(data || []);
  };

  const loadKpiProgress = async () => {
    const progressData: KpiProgress[] = [];
    
    // Load progress for each group or current user's group
    const groupsToCheck = user?.position === 'superadmin' || user?.position === 'leader' 
      ? groups 
      : user?.group_id ? [{ id: user.group_id }] : [];

    for (const group of groupsToCheck) {
      const { data, error } = await supabase
        .rpc('calculate_kpi_progress', {
          p_group_id: group.id,
          p_month: selectedPeriod.month,
          p_year: selectedPeriod.year
        });

      if (!error && data?.has_target) {
        progressData.push(data);
      }
    }
    
    setKpiProgress(progressData);
  };

  const handleInputChange = (field: keyof KpiFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (formData.target_omset <= 0 || formData.target_gross_commission <= 0 || formData.target_attendance_days <= 0) {
      setError('Semua target harus diisi dengan nilai yang valid');
      return false;
    }
    if (formData.target_attendance_days > 31) {
      setError('Target kehadiran tidak boleh lebih dari 31 hari');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const targetData = {
        ...formData,
        group_id: formData.group_id || null
      };

      if (editingTarget) {
        const { error } = await supabase
          .from('kpi_targets')
          .update(targetData)
          .eq('id', editingTarget.id);
        
        if (error) throw error;
        toast.success('Target KPI berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('kpi_targets')
          .insert([targetData]);
        
        if (error) throw error;
        toast.success('Target KPI berhasil disimpan');
      }
      
      resetForm();
      loadTargets();
      loadKpiProgress();
    } catch (error: any) {
      setError(handleSupabaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      target_month: new Date().getMonth() + 1,
      target_year: new Date().getFullYear(),
      target_omset: 0,
      target_gross_commission: 0,
      target_attendance_days: 22,
      group_id: user?.group_id || ''
    });
    setShowForm(false);
    setEditingTarget(null);
    setError('');
  };

  const handleEdit = (target: KpiTarget) => {
    setFormData({
      target_month: target.target_month,
      target_year: target.target_year,
      target_omset: target.target_omset,
      target_gross_commission: target.target_gross_commission,
      target_attendance_days: target.target_attendance_days,
      group_id: target.group_id || ''
    });
    setEditingTarget(target);
    setShowForm(true);
  };

  const handleDelete = async (target: KpiTarget) => {
    if (!confirm('Yakin ingin menghapus target KPI ini?')) return;
    
    const { error } = await supabase
      .from('kpi_targets')
      .delete()
      .eq('id', target.id);
    
    if (error) {
      toast.error('Gagal menghapus target KPI: ' + handleSupabaseError(error));
    } else {
      toast.success('Target KPI berhasil dihapus');
      loadTargets();
      loadKpiProgress();
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Prepare chart data
  const chartData = kpiProgress.map(progress => ({
    group: `Group ${progress.group_id || 'Unknown'}`,
    omset: progress.percentage.omset,
    commission: progress.percentage.commission,
    attendance: progress.percentage.attendance,
    overall: progress.overall_kpi
  }));

  const pieData = kpiProgress.length > 0 ? [
    {
      name: 'Omset',
      value: kpiProgress.reduce((sum, p) => sum + p.percentage.omset, 0) / kpiProgress.length,
      fill: '#3b82f6'
    },
    {
      name: 'Komisi',
      value: kpiProgress.reduce((sum, p) => sum + p.percentage.commission, 0) / kpiProgress.length,
      fill: '#10b981'
    },
    {
      name: 'Kehadiran',
      value: kpiProgress.reduce((sum, p) => sum + p.percentage.attendance, 0) / kpiProgress.length,
      fill: '#f59e0b'
    }
  ] : [];

  const canEdit = user?.position === 'superadmin' || user?.position === 'leader';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Goal & Target KPI</h2>
          <p className="text-muted-foreground">Kelola target dan monitor pencapaian KPI</p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Set Target
          </Button>
        )}
      </div>

      {/* Period Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Periode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label>Bulan</Label>
              <Select 
                value={selectedPeriod.month.toString()} 
                onValueChange={(value) => setSelectedPeriod(prev => ({ ...prev, month: parseInt(value) }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(2024, i).toLocaleDateString('id-ID', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tahun</Label>
              <Select 
                value={selectedPeriod.year.toString()} 
                onValueChange={(value) => setSelectedPeriod(prev => ({ ...prev, year: parseInt(value) }))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Progress Cards */}
      {kpiProgress.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {kpiProgress.map((progress, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Progress KPI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Omset</span>
                      <span className={`text-sm font-bold ${getProgressColor(progress.percentage.omset)}`}>
                        {progress.percentage.omset.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(progress.percentage.omset, 100)} 
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(progress.realization.omset)} / {formatCurrency(progress.targets.omset)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Komisi</span>
                      <span className={`text-sm font-bold ${getProgressColor(progress.percentage.commission)}`}>
                        {progress.percentage.commission.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(progress.percentage.commission, 100)} 
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(progress.realization.commission)} / {formatCurrency(progress.targets.commission)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Kehadiran</span>
                      <span className={`text-sm font-bold ${getProgressColor(progress.percentage.attendance)}`}>
                        {progress.percentage.attendance.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(progress.percentage.attendance, 100)} 
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {progress.realization.attendance.toFixed(1)} / {progress.targets.attendance} hari
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Overall KPI</span>
                    <Badge 
                      variant={progress.overall_kpi >= 100 ? 'default' : progress.overall_kpi >= 75 ? 'secondary' : 'destructive'}
                      className="text-base font-bold"
                    >
                      {progress.overall_kpi.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Progress KPI per Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  omset: { label: 'Omset', color: '#3b82f6' },
                  commission: { label: 'Komisi', color: '#10b981' },
                  attendance: { label: 'Kehadiran', color: '#f59e0b' }
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Overall KPI Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  overall: { label: 'Overall KPI', color: '#8b5cf6' }
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="group" />
                    <YAxis />
                    <Bar dataKey="overall" fill="#8b5cf6" />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Form */}
      {showForm && canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTarget ? 'Edit Target KPI' : 'Set Target KPI'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Bulan Target *</Label>
                  <Select value={formData.target_month.toString()} onValueChange={(value) => handleInputChange('target_month', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {new Date(2024, i).toLocaleDateString('id-ID', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tahun Target *</Label>
                  <Input
                    type="number"
                    value={formData.target_year}
                    onChange={(e) => handleInputChange('target_year', parseInt(e.target.value))}
                    min="2020"
                    max="2030"
                    required
                  />
                </div>

                {user?.position === 'superadmin' && (
                  <div className="space-y-2">
                    <Label>Group</Label>
                    <Select value={formData.group_id} onValueChange={(value) => handleInputChange('group_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Semua Group</SelectItem>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.group_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Target Omset *</Label>
                  <Input
                    type="number"
                    value={formData.target_omset}
                    onChange={(e) => handleInputChange('target_omset', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target Komisi Kotor *</Label>
                  <Input
                    type="number"
                    value={formData.target_gross_commission}
                    onChange={(e) => handleInputChange('target_gross_commission', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target Hari Kehadiran *</Label>
                  <Input
                    type="number"
                    value={formData.target_attendance_days}
                    onChange={(e) => handleInputChange('target_attendance_days', parseInt(e.target.value) || 0)}
                    min="1"
                    max="31"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : editingTarget ? 'Update' : 'Simpan'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Targets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Target KPI - {new Date(selectedPeriod.year, selectedPeriod.month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Target Omset</TableHead>
                  <TableHead>Target Komisi</TableHead>
                  <TableHead>Target Kehadiran</TableHead>
                  {canEdit && <TableHead className="text-right">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {targets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 5 : 4} className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      Belum ada target KPI untuk periode ini
                    </TableCell>
                  </TableRow>
                ) : (
                  targets.map((target) => (
                    <TableRow key={target.id}>
                      <TableCell>{target.group?.group_name || 'Semua Group'}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(target.target_omset)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(target.target_gross_commission)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {target.target_attendance_days} hari
                        </Badge>
                      </TableCell>
                      {canEdit && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(target)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(target)}>
                              <Trash className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}