import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Employees() {
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, groups(name)")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "superadmin":
        return "default";
      case "leader":
        return "secondary";
      case "admin":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Data Karyawan</h1>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Grup</TableHead>
                <TableHead>Tanggal Mulai</TableHead>
                <TableHead>Tanggal Lahir</TableHead>
                <TableHead>Alamat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees?.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {employee.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{employee.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{employee.username}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(employee.role)}>
                      {employee.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.groups?.name || "-"}</TableCell>
                  <TableCell>{employee.start_date}</TableCell>
                  <TableCell>{employee.birth_date || "-"}</TableCell>
                  <TableCell>{employee.address || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
