import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SOPDocuments() {
  const { data: documents } = useQuery({
    queryKey: ["sop-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sop_documents")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">SOP & Knowledge Center</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents?.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <FileText className="w-8 h-8 text-primary" />
                {doc.link_url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.link_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
              <CardTitle className="text-lg mt-4">{doc.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{doc.description}</p>
              <div className="text-xs text-muted-foreground">
                <p>Dibuat oleh: {doc.profiles?.full_name}</p>
                <p>Tanggal: {new Date(doc.created_at).toLocaleDateString("id-ID")}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!documents?.length && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Belum ada dokumen SOP</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
