import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Debts() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      type: "payable",
      description: "",
      amount: "",
      transaction_date: new Date().toISOString().split("T")[0],
      due_date: "",
      status: "pending",
    },
  });

  const { data: debts } = useQuery({
    queryKey: ["debts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("debts")
        .select("*")
        .order("transaction_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createDebt = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase.from("debts").insert({
        ...values,
        amount: parseFloat(values.amount),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      toast.success("Data berhasil ditambahkan");
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast.error("Gagal menambahkan data");
    },
  });

  const totalPayable = debts?.filter(d => d.type === "payable" && d.status === "pending").reduce((sum, d) => sum + Number(d.amount), 0) || 0;
  const totalReceivable = debts?.filter(d => d.type === "receivable" && d.status === "pending").reduce((sum, d) => sum + Number(d.amount), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Hutang & Piutang</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Data
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Hutang/Piutang</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createDebt.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="payable">Hutang</SelectItem>
                          <SelectItem value="receivable">Piutang</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="transaction_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Transaksi</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Jatuh Tempo</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Simpan</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Hutang Belum Lunas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">Rp {totalPayable.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Piutang Belum Lunas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Rp {totalReceivable.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Hutang & Piutang</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipe</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Tanggal Transaksi</TableHead>
                <TableHead>Jatuh Tempo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debts?.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell>
                    <Badge variant={debt.type === "payable" ? "destructive" : "default"}>
                      {debt.type === "payable" ? "Hutang" : "Piutang"}
                    </Badge>
                  </TableCell>
                  <TableCell>{debt.description}</TableCell>
                  <TableCell>Rp {Number(debt.amount).toLocaleString()}</TableCell>
                  <TableCell>{debt.transaction_date}</TableCell>
                  <TableCell>{debt.due_date || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={debt.status === "paid" ? "outline" : "secondary"}>
                      {debt.status === "paid" ? "Lunas" : "Pending"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
