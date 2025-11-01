import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { supabase, formatCurrency, formatDate, handleSupabaseError } from '../../lib/supabase';
import { Plus, Edit, Trash, TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Database } from '../../types/database';

type Cashflow = Database['public']['Tables']['cashflow']['Row'] & {
  created_by_user?: { full_name: string };
  group?: { group_name: string };
};

interface CashflowFormData {
  transaction_date: string;
  type: 'income' | 'expense';
  group_id: string;
  amount: number;
  proof_link: string;
  category: string;
  description: string;
}

export default function Cashflow() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Cashflow[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Cashflow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<CashflowFormData>({
    transaction_date: format(new Date(), 'yyyy-MM-dd'),
    type: 'expense',
    group_id: user?.group_id || '',
    amount: 0,
    proof_link: '',
    category: '',
    description: ''
  });

  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    type: 'all' as 'all' | 'income' | 'expense'
  });

  useEffect(() => {
    loadTransactions();
    loadGroups();
  }, [filters]);

  const loadTransactions = async () => {
    if (!user) return;

    const startDate = `${filters.year}-${filters.month.toString().padStart(2, '0')}-01`;
    const endDate = `${filters.year}-${filters.month.toString().padStart(2, '0')}-31`;

    let query = supabase
      .from('cashflow')
      .select(`
        *,
        created_by_user:created_by(
          full_name
        ),
        group:group_id(
          group_name
        )
      `)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    // Filter by type if not 'all'
    if (filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    // Role-based filtering
    if (user.position !== 'superadmin') {
      if (user.group_id) {
        query = query.eq('group_id', user.group_id);
      } else {
        query = query.is('group_id', null);
      }
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Gagal memuat data cashflow: ' + handleSupabaseError(error));
    } else {
      setTransactions(data || []);
    }
  };

  const loadGroups = async () => {
    const { data } = await supabase
      .from('groups')
      .select('*')
      .order('group_name');
    
    setGroups(data || []);
  };

  const handleInputChange = (field: keyof CashflowFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.description || formData.amount <= 0) {
      setError('Deskripsi dan jumlah wajib diisi dengan benar');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    setLoading(true);
    try {
      const transactionData = {
        ...formData,
        created_by: user.id,
        group_id: formData.group_id || null,
        category: formData.category || null
      };

      if (editingTransaction) {
        const { error } = await supabase
          .from('cashflow')
          .update(transactionData)
          .eq('id', editingTransaction.id);
        
        if (error) throw error;
        toast.success('Transaksi berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('cashflow')
          .insert([transactionData]);
        
        if (error) throw error;
        toast.success('Transaksi berhasil disimpan');
      }
      
      resetForm();
      loadTransactions();
    } catch (error: any) {
      setError(handleSupabaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      transaction_date: format(new Date(), 'yyyy-MM-dd'),
      type: 'expense',
      group_id: user?.group_id || '',
      amount: 0,
      proof_link: '',
      category: '',
      description: ''
    });
    setShowForm(false);
    setEditingTransaction(null);
    setError('');
  };

  const handleEdit = (transaction: Cashflow) => {
    setFormData({
      transaction_date: transaction.transaction_date,
      type: transaction.type,
      group_id: transaction.group_id || '',
      amount: transaction.amount,
      proof_link: transaction.proof_link || '',
      category: transaction.category || '',
      description: transaction.description
    });
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = async (transaction: Cashflow) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;
    
    const { error } = await supabase
      .from('cashflow')
      .delete()
      .eq('id', transaction.id);
    
    if (error) {
      toast.error('Gagal menghapus transaksi: ' + handleSupabaseError(error));
    } else {
      toast.success('Transaksi berhasil dihapus');
      loadTransactions();
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'income' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getCategoryOptions = (type: 'income' | 'expense') => {
    if (type === 'expense') {
      return [
        { value: 'fix_cost', label: 'Biaya Tetap' },
        { value: 'variable_cost', label: 'Biaya Variabel' }
      ];
    }
    return [];
  };

  // Calculate summaries
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netCashflow = totalIncome - totalExpense;

  const canEdit = user?.position === 'superadmin' || user?.position === 'leader' || user?.position === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cashflow</h2>
          <p className="text-muted-foreground">Kelola arus kas dan pembukuan</p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Transaksi
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cashflow</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              netCashflow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(netCashflow)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
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
            <div className="space-y-2">
              <Label>Tipe</Label>
              <Select value={filters.type} onValueChange={(value: any) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
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
            <CardTitle>{editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}</CardTitle>
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
                  <Label>Tanggal Transaksi *</Label>
                  <Input
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => handleInputChange('transaction_date', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipe Transaksi *</Label>
                  <Select value={formData.type} onValueChange={(value: any) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Pemasukan</SelectItem>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {user?.position === 'superadmin' && (
                  <div className="space-y-2">
                    <Label>Group</Label>
                    <Select value={formData.group_id} onValueChange={(value) => handleInputChange('group_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tanpa Group</SelectItem>
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
                  <Label>Jumlah *</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {formData.type === 'expense' && (
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCategoryOptions('expense').map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Link Bukti</Label>
                  <Input
                    type="url"
                    value={formData.proof_link}
                    onChange={(e) => handleInputChange('proof_link', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deskripsi *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Jelaskan transaksi ini..."
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : editingTransaction ? 'Update' : 'Simpan'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi - {new Date(filters.year, filters.month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Dibuat oleh</TableHead>
                  {canEdit && <TableHead className="text-right">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 8 : 7} className="text-center py-8 text-muted-foreground">
                      Belum ada transaksi untuk periode ini
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(transaction.type)} variant="secondary">
                          {transaction.type === 'income' ? 'Masuk' : 'Keluar'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={transaction.description}>
                          {transaction.description}
                        </div>
                        {transaction.proof_link && (
                          <a 
                            href={transaction.proof_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Lihat Bukti
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.category && (
                          <Badge variant="outline" className="text-xs">
                            {transaction.category === 'fix_cost' ? 'Tetap' : 'Variabel'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className={`font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>{transaction.group?.group_name || '-'}</TableCell>
                      <TableCell>{transaction.created_by_user?.full_name}</TableCell>
                      {canEdit && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(transaction)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(transaction)}>
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