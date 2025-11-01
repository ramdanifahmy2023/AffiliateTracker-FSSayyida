import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Users, UsersRound, DollarSign, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("bulan");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const { data } = await supabase
      .from('groups')
      .select('*')
      .order('name');
    if (data) setGroups(data);
  };

  // Mock data for demonstration
  const stats = [
    {
      title: "Total Komisi Kotor",
      value: "Rp 125.500.000",
      change: 12.5,
      isPositive: true,
      icon: DollarSign,
      color: "chart-1"
    },
    {
      title: "Total Komisi Bersih",
      value: "Rp 112.950.000",
      change: 10.2,
      isPositive: true,
      icon: DollarSign,
      color: "chart-2"
    },
    {
      title: "Total Komisi Cair",
      value: "Rp 98.450.000",
      change: 8.7,
      isPositive: true,
      icon: Receipt,
      color: "chart-2"
    },
    {
      title: "Total Pengeluaran",
      value: "Rp 45.250.000",
      change: 5.3,
      isPositive: false,
      icon: Receipt,
      color: "chart-3"
    },
    {
      title: "Total Karyawan",
      value: "24",
      change: 0,
      isPositive: true,
      icon: Users,
      color: "chart-4"
    },
    {
      title: "Total Group",
      value: "3",
      change: 0,
      isPositive: true,
      icon: UsersRound,
      color: "chart-5"
    },
  ];

  const topPerformers = [
    { name: "Ahmad Ridwan", omzet: 45500000, progress: 91 },
    { name: "Siti Nurhaliza", omzet: 42300000, progress: 85 },
    { name: "Budi Santoso", omzet: 38900000, progress: 78 },
    { name: "Rina Wati", omzet: 35200000, progress: 70 },
    { name: "Doni Pratama", omzet: 32100000, progress: 64 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di sistem manajemen affiliate marketing
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Pilih Periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hari">Hari Ini</SelectItem>
            <SelectItem value="minggu">Minggu Ini</SelectItem>
            <SelectItem value="bulan">Bulan Ini</SelectItem>
            <SelectItem value="tahun">Tahun Ini</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Pilih Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Group</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Pilih Karyawan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Karyawan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={cn(
                "p-2 rounded-lg",
                `bg-${stat.color}/10`
              )}>
                <stat.icon className={cn("h-4 w-4", `text-${stat.color}`)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change !== 0 && (
                <div className="flex items-center text-xs mt-1">
                  {stat.isPositive ? (
                    <TrendingUp className="h-4 w-4 text-success mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive mr-1" />
                  )}
                  <span className={stat.isPositive ? "text-success" : "text-destructive"}>
                    {stat.change}%
                  </span>
                  <span className="text-muted-foreground ml-1">vs bulan lalu</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ranking Karyawan */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking Karyawan Terbaik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topPerformers.map((performer, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary text-lg">#{index + 1}</span>
                  <span className="font-medium">{performer.name}</span>
                </div>
                <span className="font-semibold">
                  Rp {performer.omzet.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500"
                  style={{ width: `${performer.progress}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Charts Placeholder */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Diagram Omset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart akan ditambahkan di sini
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diagram Komisi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart akan ditambahkan di sini
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;