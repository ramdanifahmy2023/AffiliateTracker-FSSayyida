import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, Session } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Users,
  Smartphone,
  UserCircle,
  Receipt,
  Wallet,
  FileText,
  Target,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Package,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserRole(session.user.id);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (data && !error) {
      setUserRole(data.role);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: TrendingUp, label: "Performa Tim", path: "/performance" },
    { icon: FileText, label: "Laporan Harian", path: "/daily-reports", roles: ["staff"] },
    { icon: Receipt, label: "Data Komisi", path: "/commissions" },
    { icon: Wallet, label: "Cashflow", path: "/cashflow" },
    { icon: Package, label: "Asset", path: "/assets" },
    { icon: Receipt, label: "Hutang Piutang", path: "/debts" },
    { icon: BookOpen, label: "SOP & Knowledge", path: "/sop" },
    { icon: TrendingUp, label: "Laba Rugi", path: "/profit-loss" },
    { icon: Users, label: "Direktori Karyawan", path: "/employees" },
    { icon: Smartphone, label: "Device", path: "/devices" },
    { icon: UserCircle, label: "Akun Affiliate", path: "/accounts" },
    { icon: Users, label: "Group", path: "/groups" },
    { icon: Target, label: "Goal & KPI", path: "/kpi" },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userRole || "");
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          {mobileSidebarOpen ? <X /> : <Menu />}
        </Button>
        <h1 className="font-bold text-lg">Master Affiliate Hub</h1>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-card border-r border-border transition-all duration-300 z-40",
          sidebarOpen ? "w-64" : "w-20",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            {sidebarOpen && (
              <h1 className="font-bold text-lg text-primary">Affiliate Hub</h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            {filteredMenuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 px-4 mb-1",
                  !sidebarOpen && "justify-center px-2"
                )}
                onClick={() => {
                  navigate(item.path);
                  setMobileSidebarOpen(false);
                }}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Button>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-border p-4">
            <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center")}>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <UserCircle className="h-5 w-5 text-primary" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <Button
                variant="outline"
                className="w-full mt-3"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300 pt-16 lg:pt-0",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;