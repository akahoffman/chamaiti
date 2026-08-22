import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, Ticket, Database, LogOut, Menu, X, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/chamados", label: "Chamados", icon: Ticket },
  { to: "/cadastros", label: "Cadastros", icon: Database },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary-container text-primary-container-foreground"
                : "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-border bg-surface-1 p-4 md:flex">
        <div className="px-2 pt-2">
          <span className="mono-label">helpdesk ti</span>
          <p className="text-base font-semibold text-foreground">Chamados</p>
        </div>
        <Button asChild size="fab" className="justify-start">
          <Link to="/chamados/novo">
            <Plus /> Novo chamado
          </Link>
        </Button>
        {nav}
        <div className="border-t border-border pt-3">
          <p className="truncate px-2 font-mono text-xs text-muted-foreground">{email}</p>
          <Button variant="ghost" className="mt-2 w-full justify-start" onClick={signOut}>
            <LogOut /> Sair
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-surface-1 px-4 py-3 md:hidden">
          <button aria-label="Menu" onClick={() => setOpen((v) => !v)} className="p-2">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <span className="font-mono text-sm">helpdesk ti</span>
          <Button size="sm" asChild>
            <Link to="/chamados/novo">Novo</Link>
          </Button>
        </header>

        {open && (
          <div className="flex flex-col gap-2 border-b border-border bg-surface-1 p-4 md:hidden">
            {nav}
            <Button variant="ghost" className="justify-start" onClick={signOut}>
              <LogOut /> Sair
            </Button>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
