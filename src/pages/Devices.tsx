import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Smartphone } from "lucide-react";

export default function Devices() {
  const { data: devices } = useQuery({
    queryKey: ["devices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devices")
        .select("*, groups(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalValue = devices?.reduce((sum, d) => sum + (Number(d.purchase_price) || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventaris Perangkat</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Perangkat</CardTitle>
            <Smartphone className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Nilai Perangkat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Perangkat</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device ID</TableHead>
                <TableHead>IMEI</TableHead>
                <TableHead>Grup</TableHead>
                <TableHead>Google Account</TableHead>
                <TableHead>Tanggal Pembelian</TableHead>
                <TableHead>Harga Pembelian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices?.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.device_id}</TableCell>
                  <TableCell>{device.imei}</TableCell>
                  <TableCell>{device.groups?.name || "-"}</TableCell>
                  <TableCell>{device.google_account || "-"}</TableCell>
                  <TableCell>{device.purchase_date || "-"}</TableCell>
                  <TableCell>
                    {device.purchase_price ? `Rp ${Number(device.purchase_price).toLocaleString()}` : "-"}
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
