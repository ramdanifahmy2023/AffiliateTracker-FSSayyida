import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AuditTrail() {
  const { data: auditLogs } = useQuery({
    queryKey: ["audit-trail"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_trail")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case "INSERT":
        return <Badge variant="default">Create</Badge>;
      case "UPDATE":
        return <Badge variant="secondary">Update</Badge>;
      case "DELETE":
        return <Badge variant="destructive">Delete</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Audit Trail</h1>

      <Card>
        <CardHeader>
          <CardTitle>Log Aktivitas Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Entitas</TableHead>
                <TableHead>Entity ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.created_at).toLocaleString("id-ID", {
                      dateStyle: "short",
                      timeStyle: "medium",
                    })}
                  </TableCell>
                  <TableCell>{log.profiles?.full_name || "System"}</TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell className="capitalize">{log.entity_type.replace("_", " ")}</TableCell>
                  <TableCell className="font-mono text-xs">{log.entity_id.slice(0, 8)}...</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
