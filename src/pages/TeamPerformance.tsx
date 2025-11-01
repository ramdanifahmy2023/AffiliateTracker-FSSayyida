import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function TeamPerformance() {
  const [periodFilter, setPeriodFilter] = useState("current-month");
  const [groupFilter, setGroupFilter] = useState("all");

  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase.from("groups").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["profiles-performance", groupFilter],
    queryFn: async () => {
      let query = supabase.from("profiles").select("*, groups(name)");
      if (groupFilter !== "all") {
        query = query.eq("group_id", groupFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Performa Tim</h1>
        <div className="flex gap-4">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Bulan Ini</SelectItem>
              <SelectItem value="last-month">Bulan Lalu</SelectItem>
              <SelectItem value="current-quarter">Kuartal Ini</SelectItem>
            </SelectContent>
          </Select>
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Grup" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Grup</SelectItem>
              {groups?.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Grup</TableHead>
                <TableHead>Total Omzet</TableHead>
                <TableHead>Total Komisi</TableHead>
                <TableHead>Kehadiran</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles?.map((profile, index) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">#{index + 1}</TableCell>
                  <TableCell>{profile.full_name}</TableCell>
                  <TableCell>{profile.groups?.name || "-"}</TableCell>
                  <TableCell>Rp 0</TableCell>
                  <TableCell>Rp 0</TableCell>
                  <TableCell>0 hari</TableCell>
                  <TableCell>
                    <Badge variant="outline">Active</Badge>
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
