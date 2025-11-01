import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AffiliateAccounts() {
  const { data: accounts } = useQuery({
    queryKey: ["affiliate-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_accounts")
        .select("*, groups(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const activeAccounts = accounts?.filter(a => a.account_status === "active").length || 0;
  const totalAccounts = accounts?.length || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Akun Affiliate</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Akun</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAccounts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Akun Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeAccounts}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Grup</TableHead>
                <TableHead>Status Akun</TableHead>
                <TableHead>Status Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts?.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium capitalize">{account.platform}</TableCell>
                  <TableCell>{account.username}</TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.phone_number || "-"}</TableCell>
                  <TableCell>{account.groups?.name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={account.account_status === "active" ? "default" : "secondary"}>
                      {account.account_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {account.data_status}
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
