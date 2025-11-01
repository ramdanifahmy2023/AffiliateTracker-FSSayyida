import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Commissions() {
  const { data: commissions } = useQuery({
    queryKey: ["commission-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalGross = commissions?.reduce((sum, c) => sum + Number(c.gross_commission), 0) || 0;
  const totalNet = commissions?.reduce((sum, c) => sum + Number(c.net_commission), 0) || 0;
  const totalDisbursed = commissions?.reduce((sum, c) => sum + Number(c.disbursed_commission), 0) || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Laporan Komisi</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Komisi Kotor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalGross.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Komisi Bersih</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalNet.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Terdisbursement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalDisbursed.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Komisi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Periode</TableHead>
                <TableHead>Tanggal Mulai</TableHead>
                <TableHead>Tanggal Akhir</TableHead>
                <TableHead>Komisi Kotor</TableHead>
                <TableHead>Komisi Bersih</TableHead>
                <TableHead>Terdisbursement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions?.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>{commission.week_period}</TableCell>
                  <TableCell>{commission.start_date}</TableCell>
                  <TableCell>{commission.end_date}</TableCell>
                  <TableCell>Rp {Number(commission.gross_commission).toLocaleString()}</TableCell>
                  <TableCell>Rp {Number(commission.net_commission).toLocaleString()}</TableCell>
                  <TableCell>Rp {Number(commission.disbursed_commission).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
