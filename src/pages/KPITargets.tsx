import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

export default function KPITargets() {
  const { data: targets } = useQuery({
    queryKey: ["kpi-targets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kpi_targets")
        .select("*, profiles(full_name), groups(name)")
        .order("period_year", { ascending: false })
        .order("period_month", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getMonthName = (month: number) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return months[month - 1];
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Target KPI</h1>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Target KPI</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Periode</TableHead>
                <TableHead>Karyawan/Grup</TableHead>
                <TableHead>Target Omzet</TableHead>
                <TableHead>Target Komisi</TableHead>
                <TableHead>Target Kehadiran</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {targets?.map((target) => (
                <TableRow key={target.id}>
                  <TableCell>
                    {getMonthName(target.period_month)} {target.period_year}
                  </TableCell>
                  <TableCell>
                    {target.profiles?.full_name || target.groups?.name || "-"}
                  </TableCell>
                  <TableCell>Rp {Number(target.target_omzet).toLocaleString()}</TableCell>
                  <TableCell>Rp {Number(target.target_gross_commission).toLocaleString()}</TableCell>
                  <TableCell>{target.target_attendance_days} hari</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={0} className="w-[100px]" />
                      <span className="text-sm text-muted-foreground">0%</span>
                    </div>
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
