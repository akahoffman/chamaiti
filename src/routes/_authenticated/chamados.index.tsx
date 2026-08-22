import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  OPEN_STATUSES,
  STATUS_LABEL,
  STATUS_ORDER,
  URGENCY_RANK,
  formatDateTime,
  ticketNumber,
  type TicketStatus,
  type TicketUrgency,
} from "@/lib/helpdesk";
import { Mono, StatusBadge, UrgencyBadge } from "@/components/helpdesk-badges";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/chamados/")({
  head: () => ({
    meta: [
      { title: "Chamados — Central de Chamados de TI" },
      { name: "description", content: "Lista completa de chamados registrados pela equipe." },
      { property: "og:title", content: "Chamados — Central de Chamados de TI" },
      { property: "og:description", content: "Lista completa de chamados registrados." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TicketsPage,
});

type Row = {
  id: string;
  number: string;
  title: string;
  status: TicketStatus;
  urgency: TicketUrgency;
  created_at: string;
  requesters: { name: string } | null;
  sectors: { name: string } | null;
  technicians: { name: string } | null;
};

type Filter = "abertos" | "todos" | TicketStatus;

export function TicketsPage() {
  const [filter, setFilter] = useState<Filter>("abertos");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(
          "id, number, title, status, urgency, created_at, requesters(name), sectors(name), technicians(name)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const rows = useMemo(() => {
    let list = data ?? [];
    if (filter === "abertos") list = list.filter((r) => OPEN_STATUSES.includes(r.status));
    else if (filter !== "todos") list = list.filter((r) => r.status === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((r) =>
        [r.number, r.title, r.requesters?.name, r.sectors?.name, r.technicians?.name]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      );
    }
    return [...list].sort((a, b) => URGENCY_RANK[b.urgency] - URGENCY_RANK[a.urgency]);
  }, [data, filter, search]);

  const filters: { key: Filter; label: string }[] = [
    { key: "abertos", label: "Em aberto" },
    { key: "todos", label: "Todos" },
    ...STATUS_ORDER.map((s) => ({ key: s as Filter, label: STATUS_LABEL[s] })),
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="mono-label">chamados</span>
          <h1 className="text-2xl font-semibold text-foreground">Lista de chamados</h1>
        </div>
        <Button asChild>
          <Link to="/chamados/novo">Novo chamado</Link>
        </Button>
      </header>

      <div className="space-y-3">
        <Input
          placeholder="Buscar por número, título, solicitante, setor ou técnico"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-lg"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f.key
                  ? "bg-primary-container text-primary-container-foreground"
                  : "bg-surface-2 text-muted-foreground hover:bg-surface-3",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-surface-1 shadow-elev-1">
        <div className="divide-y divide-border">
          {isLoading && <p className="p-5 text-sm text-muted-foreground">Carregando...</p>}
          {!isLoading && rows.length === 0 && (
            <p className="p-5 text-sm text-muted-foreground">Nenhum chamado encontrado.</p>
          )}
          {rows.map((t) => (
            <Link
              key={t.id}
              to="/chamados/$id"
              params={{ id: t.id }}
              className="block p-4 transition-colors hover:bg-surface-2"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Mono className="text-primary">{ticketNumber(t.number)}</Mono>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {t.title}
                </span>
                <UrgencyBadge urgency={t.urgency} />
                <StatusBadge status={t.status} />
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                <span>Solicitante: {t.requesters?.name ?? "—"}</span>
                <span>Setor: {t.sectors?.name ?? "—"}</span>
                <span>Técnico: {t.technicians?.name ?? "não atribuído"}</span>
                <Mono className="text-xs">{formatDateTime(t.created_at)}</Mono>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
