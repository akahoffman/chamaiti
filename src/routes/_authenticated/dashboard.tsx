import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import {
  OPEN_STATUSES,
  STATUS_LABEL,
  STATUS_ORDER,
  formatDateTime,
  ticketNumber,
  type TicketStatus,
  type TicketUrgency,
} from "@/lib/helpdesk";
import { Mono, StatusBadge, UrgencyBadge } from "@/components/helpdesk-badges";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel — Central de Chamados de TI" },
      { name: "description", content: "Visão geral dos chamados de TI em andamento." },
      { property: "og:title", content: "Painel — Central de Chamados de TI" },
      { property: "og:description", content: "Visão geral dos chamados de TI em andamento." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

type Row = {
  id: string;
  number: string;
  title: string;
  status: TicketStatus;
  urgency: TicketUrgency;
  created_at: string;
  requesters: { name: string } | null;
  technicians: { name: string } | null;
};

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("id, number, title, status, urgency, created_at, requesters(name), technicians(name)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const rows = data ?? [];
  const counts = STATUS_ORDER.map((s) => ({
    status: s,
    total: rows.filter((r) => r.status === s).length,
  }));
  const open = rows.filter((r) => OPEN_STATUSES.includes(r.status));
  const critical = open.filter((r) => r.urgency === "critica" || r.urgency === "alta");
  const resolved = rows.filter((r) => r.status === "resolvido");

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <span className="mono-label">painel</span>
        <h1 className="text-2xl font-semibold text-foreground">Visão geral</h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Chamados abertos", value: open.length },
          { label: "Alta / crítica", value: critical.length },
          { label: "Resolvidos (aguardando encerramento)", value: resolved.length },
          { label: "Total registrado", value: rows.length },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl bg-surface-1 p-5 shadow-elev-1">
            <p className="mono-label">{c.label}</p>
            <p className="mt-2 font-mono text-3xl font-semibold text-foreground">{c.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-surface-1 p-5 shadow-elev-1">
        <h2 className="text-sm font-semibold text-foreground">Distribuição por status</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {counts.map((c) => (
            <div key={c.status} className="rounded-xl bg-surface-2 px-4 py-3">
              <p className="text-xs text-muted-foreground">{STATUS_LABEL[c.status]}</p>
              <p className="font-mono text-xl text-foreground">{c.total}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-surface-1 shadow-elev-1">
        <h2 className="border-b border-border p-5 text-sm font-semibold text-foreground">
          Chamados em aberto
        </h2>
        <div className="divide-y divide-border">
          {isLoading && <p className="p-5 text-sm text-muted-foreground">Carregando...</p>}
          {!isLoading && open.length === 0 && (
            <p className="p-5 text-sm text-muted-foreground">Nenhum chamado em aberto.</p>
          )}
          {open.slice(0, 12).map((t) => (
            <Link
              key={t.id}
              to="/chamados/$id"
              params={{ id: t.id }}
              className="flex flex-wrap items-center gap-3 p-4 transition-colors hover:bg-surface-2"
            >
              <Mono className="text-primary">{ticketNumber(t.number)}</Mono>
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{t.title}</span>
              <span className="text-xs text-muted-foreground">
                {t.requesters?.name ?? "sem solicitante"}
              </span>
              <UrgencyBadge urgency={t.urgency} />
              <StatusBadge status={t.status} />
              <Mono className="text-xs text-muted-foreground">{formatDateTime(t.created_at)}</Mono>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
