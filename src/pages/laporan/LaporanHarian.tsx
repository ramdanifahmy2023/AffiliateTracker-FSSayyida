import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { supabase, formatCurrency, formatDate, validateShiftSequence, getOpeningBalance, handleSupabaseError } from '../../lib/supabase';
import { CalendarIcon, Plus, Edit, Trash, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import type { Database } from '../../types/database';

type DailyReport = Database['public']['Tables']['daily_reports']['Row'] & {
  users?: { full_name: string };
  devices?: { device_id: string };
  affiliate_accounts?: { username: string; platform: string };
};

interface ReportFormData {
  report_date: string;
  shift: string;
  device_id: string;
  account_username: string;
  product_category: string;
  live_status: string;
  opening_balance: number;
  closing_balance: number;
}

export default function LaporanHarian() {
  const { user } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<ReportFormData>({
    report_date: format(new Date(), 'yyyy-MM-dd'),
    shift: '1',
    device_id: '',
    account_username: '',
    product_category: 'fashion',
    live_status: 'lancar',
    opening_balance: 0,
    closing_balance: 0
  });

  useEffect(() => {
    loadReports();
    loadDevices();
    loadAccounts();
  }, []);

  const loadReports = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('daily_reports')
      .select(`
        *,
        users:user_id(full_name),
        devices:device_id(device_id),
        affiliate_accounts:account_username(username, platform)
      `)
      .eq('user_id', user.id)
      .order('report_date', { ascending: false })
      .order('shift', { ascending: false })
      .limit(50);
    
    if (error) {
      toast.error('Gagal memuat laporan: ' + handleSupabaseError(error));
    } else {
      setReports(data || []);
    }
  };

  const loadDevices = async () => {
    if (!user?.group_id) return;
    
    const { data } = await supabase
      .from('devices')
      .select('*')
      .eq('group_id', user.group_id)
      .order('device_id');
    
    setDevices(data || []);
  };

  const loadAccounts = async () => {
    if (!user?.group_id) return;
    
    const { data } = await supabase
      .from('affiliate_accounts')
      .select('*')
      .eq('group_id', user.group_id)
      .eq('account_status', 'active')
      .order('username');
    
    setAccounts(data || []);
  };

  const handleInputChange = (field: keyof ReportFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const calculateOpeningBalance = async () => {
    if (!user || !formData.device_id || !formData.report_date || !formData.shift) {
      return;
    }

    try {
      const openingBalance = await getOpeningBalance(
        user.id,
        formData.device_id,
        formData.report_date,
        formData.shift,
        formData.live_status
      );
      
      setFormData(prev => ({ ...prev, opening_balance: openingBalance }));
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghitung saldo awal');
    }
  };

  useEffect(() => {
    if (formData.device_id && formData.report_date && formData.shift && formData.live_status) {
      calculateOpeningBalance();
    }
  }, [formData.device_id, formData.report_date, formData.shift, formData.live_status]);

  const validateForm = async (): Promise<boolean> => {
    if (!user) return false;

    // Basic validation
    if (!formData.device_id || !formData.account_username || !formData.closing_balance) {
      setError('Semua field wajib diisi');
      return false;
    }

    if (formData.closing_balance < 0) {
      setError('Saldo akhir tidak boleh negatif');
      return false;
    }

    // Validate shift sequence
    const shiftValidation = await validateShiftSequence(
      user.id,
      formData.report_date,
      formData.shift
    );
    
    if (!shiftValidation.valid) {
      setError(shiftValidation.message || 'Validasi shift gagal');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const isValid = await validateForm();
    if (!isValid) return;

    setLoading(true);
    
    try {
      const reportData = {
        ...formData,
        user_id: user.id,
        group_id: user.group_id!,
        closing_balance: Number(formData.closing_balance)
      };

      if (editingReport) {
        const { error } = await supabase
          .from('daily_reports')
          .update(reportData)
          .eq('id', editingReport.id);
        
        if (error) throw error;
        toast.success('Laporan berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('daily_reports')
          .insert([reportData]);
        
        if (error) throw error;
        toast.success('Laporan berhasil disimpan');
      }
      
      resetForm();
      loadReports();
    } catch (error: any) {
      setError(handleSupabaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      report_date: format(new Date(), 'yyyy-MM-dd'),
      shift: '1',
      device_id: '',
      account_username: '',
      product_category: 'fashion',
      live_status: 'lancar',
      opening_balance: 0,
      closing_balance: 0
    });
    setShowForm(false);
    setEditingReport(null);
    setError('');
  };

  const handleEdit = (report: DailyReport) => {
    setFormData({
      report_date: report.report_date,
      shift: report.shift,
      device_id: report.device_id,
      account_username: report.account_username,
      product_category: report.product_category,
      live_status: report.live_status,
      opening_balance: report.opening_balance,
      closing_balance: report.closing_balance
    });
    setEditingReport(report);
    setShowForm(true);
  };

  const handleDelete = async (report: DailyReport) => {
    if (!confirm('Yakin ingin menghapus laporan ini?')) return;
    
    const { error } = await supabase
      .from('daily_reports')
      .delete()
      .eq('id', report.id);
    
    if (error) {
      toast.error('Gagal menghapus laporan: ' + handleSupabaseError(error));
    } else {
      toast.success('Laporan berhasil dihapus');
      loadReports();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lancar': return 'bg-green-100 text-green-800';
      case 'mati': return 'bg-red-100 text-red-800';
      case 'relive': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Laporan Harian</h2>
          <p className="text-muted-foreground">Jurnal laporan harian live streaming</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Buat Laporan
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingReport ? 'Edit Laporan' : 'Buat Laporan Baru'}</CardTitle>
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
                  <Label>Tanggal Laporan</Label>
                  <Input
                    type="date"
                    value={formData.report_date}
                    onChange={(e) => handleInputChange('report_date', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Shift</Label>
                  <Select value={formData.shift} onValueChange={(value) => handleInputChange('shift', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Shift 1</SelectItem>
                      <SelectItem value="2">Shift 2</SelectItem>
                      <SelectItem value="3">Shift 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Device</Label>
                  <Select value={formData.device_id} onValueChange={(value) => handleInputChange('device_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih device" />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.device_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Akun Affiliate</Label>
                  <Select value={formData.account_username} onValueChange={(value) => handleInputChange('account_username', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih akun" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.username} value={account.username}>
                          {account.username} ({account.platform})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kategori Produk</Label>
                  <Select value={formData.product_category} onValueChange={(value) => handleInputChange('product_category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="elektronik">Elektronik</SelectItem>
                      <SelectItem value="kecantikan">Kecantikan</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="hobi">Hobi</SelectItem>
                      <SelectItem value="otomotif">Otomotif</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status Live</Label>
                  <Select value={formData.live_status} onValueChange={(value) => handleInputChange('live_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lancar">Lancar</SelectItem>
                      <SelectItem value="mati">Mati</SelectItem>
                      <SelectItem value="relive">Relive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Saldo Awal</Label>
                  <Input
                    type="number"
                    value={formData.opening_balance}
                    onChange={(e) => handleInputChange('opening_balance', parseFloat(e.target.value) || 0)}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Saldo Akhir *</Label>
                  <Input
                    type="number"
                    value={formData.closing_balance}
                    onChange={(e) => handleInputChange('closing_balance', parseFloat(e.target.value) || 0)}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : editingReport ? 'Update' : 'Simpan'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Akun</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Saldo Awal</TableHead>
                  <TableHead>Saldo Akhir</TableHead>
                  <TableHead>Omset</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Belum ada laporan
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{formatDate(report.report_date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Shift {report.shift}</Badge>
                      </TableCell>
                      <TableCell>{report.devices?.device_id || '-'}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.account_username}</div>
                          <div className="text-xs text-muted-foreground">
                            {report.affiliate_accounts?.platform}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{report.product_category}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.live_status)} variant="secondary">
                          {report.live_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(report.opening_balance)}</TableCell>
                      <TableCell>{formatCurrency(report.closing_balance)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(report.closing_balance - report.opening_balance)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(report)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(report)}>
                            <Trash className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
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