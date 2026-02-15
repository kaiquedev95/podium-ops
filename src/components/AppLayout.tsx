import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Car,
  CalendarDays,
  ClipboardList,
  DollarSign,
  AlertCircle,
  FileText,
  Settings,
  Wrench,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/agendamentos", label: "Agendamentos", icon: CalendarDays },
  { to: "/ordens-servico", label: "Ordens de Serviço", icon: ClipboardList },
  { to: "/financeiro", label: "Contas a Receber", icon: DollarSign },
  { to: "/pendencias", label: "Pendências", icon: AlertCircle },
  { to: "/relatorios", label: "Relatórios", icon: FileText },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Wrench className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-accent-foreground">Podium</h1>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Centro Automotivo
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                AP
              </div>
              <div>
                <p className="text-xs font-medium text-sidebar-accent-foreground">Admin Podium</p>
                <p className="text-[10px] text-muted-foreground">Gerente</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => supabase.auth.signOut()}
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
