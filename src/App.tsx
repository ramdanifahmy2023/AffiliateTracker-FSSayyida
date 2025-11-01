import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TeamPerformance from "./pages/TeamPerformance";
import DailyReports from "./pages/DailyReports";
import Commissions from "./pages/Commissions";
import Cashflow from "./pages/Cashflow";
import Assets from "./pages/Assets";
import Debts from "./pages/Debts";
import SOPDocuments from "./pages/SOPDocuments";
import Employees from "./pages/Employees";
import Devices from "./pages/Devices";
import AffiliateAccounts from "./pages/AffiliateAccounts";
import Groups from "./pages/Groups";
import KPITargets from "./pages/KPITargets";
import AuditTrail from "./pages/AuditTrail";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/team-performance" element={<Layout><TeamPerformance /></Layout>} />
          <Route path="/daily-reports" element={<Layout><DailyReports /></Layout>} />
          <Route path="/commissions" element={<Layout><Commissions /></Layout>} />
          <Route path="/cashflow" element={<Layout><Cashflow /></Layout>} />
          <Route path="/assets" element={<Layout><Assets /></Layout>} />
          <Route path="/debts" element={<Layout><Debts /></Layout>} />
          <Route path="/sop" element={<Layout><SOPDocuments /></Layout>} />
          <Route path="/employees" element={<Layout><Employees /></Layout>} />
          <Route path="/devices" element={<Layout><Devices /></Layout>} />
          <Route path="/affiliate-accounts" element={<Layout><AffiliateAccounts /></Layout>} />
          <Route path="/groups" element={<Layout><Groups /></Layout>} />
          <Route path="/kpi-targets" element={<Layout><KPITargets /></Layout>} />
          <Route path="/audit-trail" element={<Layout><AuditTrail /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
