import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

export default function Groups() {
  const { data: groups } = useQuery({
    queryKey: ["groups-with-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("*, profiles(count)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manajemen Grup</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups?.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl mt-4">{group.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Dibuat: {new Date(group.created_at).toLocaleDateString("id-ID")}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!groups?.length && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Belum ada grup</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
