import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { supabase, formatCurrency, handleSupabaseError } from '../../lib/supabase';
import { Plus, Edit, Trash, Upload, Download, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '../../types/database';

type Commission = Database['public']['Tables']['commissions']['Row'] & {
  affiliate_accounts?: {
    username: string;
    platform: string;
    group_id: string;
  };
};

interface CommissionFormData {
  account_username: string;
  period_week: string;
  period_month: number;
  period_year: number;
  gross_commission: number;
  net_commission: number;
  liquid_commission: number;
}

interface CSVRow {
  account_username: string;
  period_week: string;
  period_month: string;
  period_year: string;
  gross_commission: string;
  net_commission: string;
  liquid_commission: string;
}

export default function DataKomisi() {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  
  const [formData, setFormData] = useState<CommissionFormData>({
    account_username: '',
    period_week: 'M1',
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
    gross_commission: 0,
    net_commission: 0,
    liquid_commission: 0
  });

  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    loadCommissions();
    loadAccounts();
  }, [filters]);

  const loadCommissions = async () => {
    const { data, error } = await supabase
      .from('commissions')
      .select(`
        *,
        affiliate_accounts:account_username(
          username,
          platform,
          group_id
        )
      `)
      .eq('period_month', filters.month)
      .eq('period_year', filters.year)
      .order('period_week')
      .order('account_username');

    if (error) {
      toast.error('Gagal memuat data komisi: ' + handleSupabaseError(error));
    } else {
      // Filter by user's group if not superadmin/leader
      const filteredData = data?.filter(commission => {
        if (user?.position === 'superadmin' || user?.position === 'leader') {
          return true;
        }
        return commission.affiliate_accounts?.group_id === user?.group_id;
      }) || [];
      
      setCommissions(filteredData);
    }
  };

  const loadAccounts = async () => {
    const { data } = await supabase
      .from('affiliate_accounts')
      .select('*')
      .eq('account_status', 'active')
      .order('username');
    
    // Filter by user's group if not superadmin/leader
    const filteredAccounts = data?.filter(account => {
      if (user?.position === 'superadmin' || user?.position === 'leader') {
        return true;
      }
      return account.group_id === user?.group_id;
    }) || [];
    
    setAccounts(filteredAccounts);
  };

  const handleInputChange = (field: keyof CommissionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    
    // Auto-calculate net and liquid commission based on gross
    if (field === 'gross_commission') {
      const gross = Number(value);
      const net = gross * 0.9; // 10% fee
      const liquid = net * 0.9; // 10% additional fee
      setFormData(prev => ({
        ...prev,
        [field]: gross,
        net_commission: net,
        liquid_commission: liquid
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.account_username) {
      setError('Akun affiliate wajib dipilih');
      return false;
    }
    if (formData.gross_commission < 0 || formData.net_commission < 0 || formData.liquid_commission < 0) {
      setError('Nilai komisi tidak boleh negatif');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editingCommission) {
        const { error } = await supabase
          .from('commissions')
          .update(formData)
          .eq('id', editingCommission.id);
        
        if (error) throw error;
        toast.success('Data komisi berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('commissions')
          .insert([formData]);
        
        if (error) throw error;
        toast.success('Data komisi berhasil disimpan');
      }
      
      resetForm();
      loadCommissions();
    } catch (error: any) {
      setError(handleSupabaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      account_username: '',
      period_week: 'M1',
      period_month: new Date().getMonth() + 1,
      period_year: new Date().getFullYear(),
      gross_commission: 0,
      net_commission: 0,
      liquid_commission: 0
    });
    setShowForm(false);
    setEditingCommission(null);
    setError('');
  };

  const handleEdit = (commission: Commission) => {
    setFormData({
      account_username: commission.account_username,
      period_week: commission.period_week,
      period_month: commission.period_month,
      period_year: commission.period_year,
      gross_commission: commission.gross_commission,
      net_commission: commission.net_commission,
      liquid_commission: commission.liquid_commission
    });
    setEditingCommission(commission);
    setShowForm(true);
  };

  const handleDelete = async (commission: Commission) => {
    if (!confirm('Yakin ingin menghapus data komisi ini?')) return;
    
    const { error } = await supabase
      .from('commissions')
      .delete()
      .eq('id', commission.id);
    
    if (error) {
      toast.error('Gagal menghapus data komisi: ' + handleSupabaseError(error));
    } else {
      toast.success('Data komisi berhasil dihapus');
      loadCommissions();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      toast.error('File harus berformat CSV');
      return;
    }
    
    setCsvFile(file);
    parseCSV(file);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('File CSV harus memiliki header dan minimal 1 baris data');
        return;
      }
      
      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredColumns = ['account_username', 'period_week', 'period_month', 'period_year', 'gross_commission'];
      
      const missingColumns = requiredColumns.filter(col => !header.includes(col));
      if (missingColumns.length > 0) {
        toast.error(`Kolom berikut tidak ditemukan: ${missingColumns.join(', ')}`);
        return;
      }
      
      const data: CSVRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        header.forEach((col, index) => {
          row[col] = values[index] || '';
        });
        
        // Auto-calculate net and liquid if not provided
        if (!row.net_commission) {
          row.net_commission = (parseFloat(row.gross_commission) * 0.9).toString();
        }
        if (!row.liquid_commission) {
          row.liquid_commission = (parseFloat(row.net_commission) * 0.9).toString();
        }
        
        data.push(row);
      }
      
      setCsvData(data);
    };
    reader.readAsText(file);
  };

  const handleImportCSV = async () => {
    if (csvData.length === 0) {
      toast.error('Tidak ada data untuk diimport');
      return;
    }
    
    setLoading(true);
    try {
      const importData = csvData.map(row => ({
        account_username: row.account_username,
        period_week: row.period_week,
        period_month: parseInt(row.period_month),
        period_year: parseInt(row.period_year),
        gross_commission: parseFloat(row.gross_commission),
        net_commission: parseFloat(row.net_commission),
        liquid_commission: parseFloat(row.liquid_commission)
      }));
      
      const { error } = await supabase
        .from('commissions')
        .upsert(importData, {
          onConflict: 'account_username,period_week,period_month,period_year'
        });
      
      if (error) throw error;
      
      toast.success(`Berhasil import ${csvData.length} data komisi`);
      setShowImport(false);
      setCsvFile(null);
      setCsvData([]);
      loadCommissions();
    } catch (error: any) {
      toast.error('Import gagal: ' + handleSupabaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const header = 'account_username,period_week,period_month,period_year,gross_commission,net_commission,liquid_commission\n';
    const example = 'shopee_alpha_001,M1,11,2024,5000000,4500000,4050000\n';
    const csvContent = header + example;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_komisic.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getPeriodColor = (week: string) => {
    const colors = {
      'M1': 'bg-blue-100 text-blue-800',
      'M2': 'bg-green-100 text-green-800',
      'M3': 'bg-yellow-100 text-yellow-800',
      'M4': 'bg-purple-100 text-purple-800',
      'M5': 'bg-red-100 text-red-800'
    };
    return colors[week as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const canEdit = user?.position === 'superadmin' || user?.position === 'leader';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Komisi</h2>
          <p className="text-muted-foreground">Kelola data komisi affiliate</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showImport} onOpenChange={setShowImport}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import Data Komisi dari CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={downloadTemplate} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Template
                  </Button>
                  <span className="text-sm text-muted-foreground">Download template CSV terlebih dahulu</span>
                </div>
                
                <div className="space-y-2">
                  <Label>Upload File CSV</Label>
                  <Input type="file" accept=".csv" onChange={handleFileUpload} />
                </div>
                
                {csvData.length > 0 && (
                  <div className="space-y-2">
                    <Label>Preview Data ({csvData.length} baris)</Label>
                    <div className="max-h-60 overflow-y-auto border rounded">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>Periode</TableHead>
                            <TableHead>Bulan/Tahun</TableHead>
                            <TableHead>Komisi Kotor</TableHead>
                            <TableHead>Komisi Bersih</TableHead>
                            <TableHead>Komisi Cair</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvData.slice(0, 5).map((row, index) => (
                            <TableRow key={index}>
                              <TableCell>{row.account_username}</TableCell>
                              <TableCell>{row.period_week}</TableCell>
                              <TableCell>{row.period_month}/{row.period_year}</TableCell>
                              <TableCell>{formatCurrency(parseFloat(row.gross_commission))}</TableCell>
                              <TableCell>{formatCurrency(parseFloat(row.net_commission))}</TableCell>
                              <TableCell>{formatCurrency(parseFloat(row.liquid_commission))}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {csvData.length > 5 && (
                      <p className="text-sm text-muted-foreground">... dan {csvData.length - 5} baris lainnya</p>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleImportCSV} disabled={loading || csvData.length === 0}>
                    {loading ? 'Importing...' : 'Import Data'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowImport(false)}>
                    Batal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {canEdit && (
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tambah Data
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label>Bulan</Label>
              <Select value={filters.month.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, month: parseInt(value) }))}>
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
              <Select value={filters.year.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, year: parseInt(value) }))}>
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

      {/* Form */}
      {showForm && canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCommission ? 'Edit Data Komisi' : 'Tambah Data Komisi'}</CardTitle>
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
                  <Label>Akun Affiliate *</Label>
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
                  <Label>Periode</Label>
                  <Select value={formData.period_week} onValueChange={(value) => handleInputChange('period_week', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M1">M1 (Minggu 1)</SelectItem>
                      <SelectItem value="M2">M2 (Minggu 2)</SelectItem>
                      <SelectItem value="M3">M3 (Minggu 3)</SelectItem>
                      <SelectItem value="M4">M4 (Minggu 4)</SelectItem>
                      <SelectItem value="M5">M5 (Minggu 5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Bulan</Label>
                  <Select value={formData.period_month.toString()} onValueChange={(value) => handleInputChange('period_month', parseInt(value))}>
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
                  <Label>Tahun</Label>
                  <Input
                    type="number"
                    value={formData.period_year}
                    onChange={(e) => handleInputChange('period_year', parseInt(e.target.value))}
                    min="2020"
                    max="2030"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Komisi Kotor *</Label>
                  <Input
                    type="number"
                    value={formData.gross_commission}
                    onChange={(e) => handleInputChange('gross_commission', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Komisi Bersih</Label>
                  <Input
                    type="number"
                    value={formData.net_commission}
                    onChange={(e) => handleInputChange('net_commission', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Komisi Cair</Label>
                  <Input
                    type="number"
                    value={formData.liquid_commission}
                    onChange={(e) => handleInputChange('liquid_commission', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : editingCommission ? 'Update' : 'Simpan'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Komisi - {new Date(filters.year, filters.month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Akun</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Komisi Kotor</TableHead>
                  <TableHead>Komisi Bersih</TableHead>
                  <TableHead>Komisi Cair</TableHead>
                  {canEdit && <TableHead className="text-right">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 7 : 6} className="text-center py-8 text-muted-foreground">
                      <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      Belum ada data komisi untuk periode ini
                    </TableCell>
                  </TableRow>
                ) : (
                  commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">{commission.account_username}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {commission.affiliate_accounts?.platform}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPeriodColor(commission.period_week)} variant="secondary">
                          {commission.period_week}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(commission.gross_commission)}</TableCell>
                      <TableCell>{formatCurrency(commission.net_commission)}</TableCell>
                      <TableCell>{formatCurrency(commission.liquid_commission)}</TableCell>
                      {canEdit && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(commission)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(commission)}>
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
          
          {commissions.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Komisi Kotor</div>
                <div className="text-lg font-bold">
                  {formatCurrency(commissions.reduce((sum, c) => sum + c.gross_commission, 0))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Komisi Bersih</div>
                <div className="text-lg font-bold">
                  {formatCurrency(commissions.reduce((sum, c) => sum + c.net_commission, 0))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Komisi Cair</div>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(commissions.reduce((sum, c) => sum + c.liquid_commission, 0))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}