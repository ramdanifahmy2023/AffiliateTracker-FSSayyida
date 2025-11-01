import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function DailyReports() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      report_date: new Date().toISOString().split("T")[0],
      shift: "pagi",
      category: "",
      live_status: "lancar",
      starting_balance: "",
      ending_balance: "",
      starting_omzet: "",
      ending_omzet: "",
      account_id: "",
      device_id: "",
      group_id: "",
    },
  });

  const { data: reports } = useQuery({
    queryKey: ["daily-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_reports")
        .select("*, profiles(full_name), groups(name)")
        .order("report_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createReport = useMutation({
    mutationFn: async (values: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("daily_reports").insert({
        ...values,
        user_id: user.id,
        starting_balance: parseFloat(values.starting_balance),
        ending_balance: parseFloat(values.ending_balance),
        starting_omzet: parseFloat(values.starting_omzet),
        ending_omzet: parseFloat(values.ending_omzet),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-reports"] });
      toast.success("Laporan harian berhasil ditambahkan");
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast.error("Gagal menambahkan laporan");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Laporan Harian</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Laporan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Laporan Harian</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createReport.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="report_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shift"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih shift" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pagi">Pagi</SelectItem>
                          <SelectItem value="siang">Siang</SelectItem>
                          <SelectItem value="malam">Malam</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="starting_balance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saldo Awal</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ending_balance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saldo Akhir</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="starting_omzet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Omzet Awal</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ending_omzet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Omzet Akhir</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full">Simpan</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Saldo Awal</TableHead>
                <TableHead>Saldo Akhir</TableHead>
                <TableHead>Omzet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports?.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.report_date}</TableCell>
                  <TableCell>{report.profiles?.full_name}</TableCell>
                  <TableCell className="capitalize">{report.shift}</TableCell>
                  <TableCell>{report.category}</TableCell>
                  <TableCell>Rp {report.starting_balance.toLocaleString()}</TableCell>
                  <TableCell>Rp {report.ending_balance.toLocaleString()}</TableCell>
                  <TableCell>Rp {(report.ending_omzet - report.starting_omzet).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
