import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mono, StatusBadge, UrgencyBadge } from "@/components/helpdesk-badges";
import {
  HISTORY_LABEL,
  STATUS_LABEL,
  STATUS_ORDER,
  formatDateTime,
  ticketNumber,
  type TicketStatus,
  type TicketUrgency,
} from "@/lib/helpdesk";

export const Route = createFileRoute("/_authenticated/chamados/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe do chamado — Central de Chamados de TI" },
      { name: "description", content: "Histórico, comentários e atendimento do chamado." },
      { property: "og:title", content: "Detalhe do chamado — Central de Chamados de TI" },
      { property: "og:description", content: "Histórico e atendimento do chamado." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TicketDetail,
});

type Ticket = {
  id: string;
  number: string;
  title: string;
  description: string;
  status: TicketStatus;
  urgency: TicketUrgency;
  created_at: string;
  first_attended_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  solution: string | null;
  final_note: string | null;
  technician_id: string | null;
  unresolved_reason_id: string | null;
  requesters: { name: string; phone: string | null } | null;
  sectors: { name: string } | null;
  categories: { name: string; group_name: string } | null;
};

function TicketDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");
  const [solution, setSolution] = useState("");
  const [finalNote, setFinalNote] = useState("");
  const [reasonId, setReasonId] = useState("");
  const [busy, setBusy] = useState(false);

  const ticketQ = useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(
          "id, number, title, description, status, urgency, created_at, first_attended_at, resolved_at, closed_at, solution, final_note, technician_id, unresolved_reason_id, requesters(name, phone), sectors(name), categories(name, group_name)",
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as Ticket;
    },
  });

  const historyQ = useQuery({
    queryKey: ["ticket-history", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_history")
        .select("id, action, detail, created_at")
        .eq("ticket_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const commentsQ = useQuery({
    queryKey: ["ticket-comments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_comments")
        .select("id, content, created_at")
        .eq("ticket_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const attachmentsQ = useQuery({
    queryKey: ["ticket-attachments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_attachments")
        .select("id, file_name, file_path, file_size")
        .eq("ticket_id", id)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const techniciansQ = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("technicians")
        .select("id, name")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const reasonsQ = useQuery({
    queryKey: ["unresolved-reasons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unresolved_reasons")
        .select("id, name")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const t = ticketQ.data;

  function refresh() {
    qc.invalidateQueries({ queryKey: ["ticket", id] });
    qc.invalidateQueries({ queryKey: ["ticket-history", id] });
    qc.invalidateQueries({ queryKey: ["tickets"] });
  }

  async function patch(values: Record<string, unknown>, message: string) {
    setBusy(true);
    const { error } = await supabase.from("tickets").update(values).eq("id", id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(message);
    refresh();
  }

  async function changeStatus(status: TicketStatus) {
    const values: Record<string, unknown> = { status };
    if (status === "em_atendimento" && t && !t.first_attended_at)
      values['first_attended_at'] = new Date().toISOString();
    await patch(values, `Status alterado para ${STATUS_LABEL[status]}.`);
  }

  async function assign(technicianId: string) {
    await patch({ technician_id: technicianId || null }, "Técnico atualizado.");
  }

  async function resolve() {
    if (!solution.trim()) return toast.error("Descreva a solução aplicada.");
    await patch(
      { status: "resolvido", solution: solution.trim(), resolved_at: new Date().toISOString() },
      "Chamado marcado como resolvido.",
    );
    setSolution("");
  }

  async function close() {
    await patch(
      {
        status: "encerrado",
        closed_at: new Date().toISOString(),
        final_note: finalNote.trim() || null,
        unresolved_reason_id: reasonId || null,
      },
      "Chamado encerrado.",
    );
    setFinalNote("");
  }

  async function addComment() {
    if (!comment.trim()) return;
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("ticket_comments").insert({
      ticket_id: id,
      content: comment.trim(),
      author_id: userData.user?.id ?? null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setComment("");
    qc.invalidateQueries({ queryKey: ["ticket-comments", id] });
    qc.invalidateQueries({ queryKey: ["ticket-history", id] });
  }

  async function openAttachment(path: string) {
    const { data, error } = await supabase.storage
      .from("ticket-attachments")
      .createSignedUrl(path, 60);
    if (error || !data) return toast.error("Não foi possível abrir o anexo.");
    window.open(data.signedUrl, "_blank", "noopener");
  }

  if (ticketQ.isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>;
  if (!t) return <p className="text-sm text-muted-foreground">Chamado não encontrado.</p>;

  const selectClass =
    "h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-foreground";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-2">
        <Link to="/chamados" className="mono-label hover:text-foreground">
          ← chamados
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <Mono className="text-primary">{ticketNumber(t.number)}</Mono>
          <h1 className="min-w-0 flex-1 text-2xl font-semibold text-foreground">{t.title}</h1>
          <UrgencyBadge urgency={t.urgency} />
          <StatusBadge status={t.status} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-surface-1 p-5 shadow-elev-1">
            <span className="mono-label">descrição</span>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
              {t.description || "—"}
            </p>
            {t.solution && (
              <div className="mt-4 rounded-xl bg-success/10 p-3">
                <span className="mono-label">solução</span>
                <p className="mt-1 whitespace-pre-wrap text-sm">{t.solution}</p>
              </div>
            )}
            {t.final_note && (
              <div className="mt-3 rounded-xl bg-surface-2 p-3">
                <span className="mono-label">observação final</span>
                <p className="mt-1 whitespace-pre-wrap text-sm">{t.final_note}</p>
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-surface-1 p-5 shadow-elev-1">
            <span className="mono-label">anexos</span>
            <div className="mt-2 space-y-2">
              {(attachmentsQ.data ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum anexo.</p>
              )}
              {(attachmentsQ.data ?? []).map((a) => (
                <button
                  key={a.id}
                  onClick={() => openAttachment(a.file_path)}
                  className="block w-full rounded-xl bg-surface-2 px-3 py-2 text-left text-sm hover:bg-surface-3"
                >
                  {a.file_name}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-surface-1 p-5 shadow-elev-1">
            <span className="mono-label">comentários</span>
            <div className="mt-3 space-y-3">
              {(commentsQ.data ?? []).map((c) => (
                <div key={c.id} className="rounded-xl bg-surface-2 p-3">
                  <Mono className="text-xs text-muted-foreground">
                    {formatDateTime(c.created_at)}
                  </Mono>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{c.content}</p>
                </div>
              ))}
              {(commentsQ.data ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum comentário ainda.</p>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <Textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Registrar andamento interno"
              />
              <Button onClick={addComment} disabled={busy}>
                Comentar
              </Button>
            </div>
          </section>

          <section className="rounded-2xl bg-surface-1 p-5 shadow-elev-1">
            <span className="mono-label">histórico</span>
            <ol className="mt-3 space-y-2">
              {(historyQ.data ?? []).map((h) => (
                <li key={h.id} className="flex gap-3 text-sm">
                  <Mono className="shrink-0 text-xs text-muted-foreground">
                    {formatDateTime(h.created_at)}
                  </Mono>
                  <span className="text-foreground">
                    <strong className="font-medium">
                      {HISTORY_LABEL[h.action] ?? h.action}
                    </strong>
                    {h.detail ? ` — ${h.detail}` : ""}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="space-y-3 rounded-2xl bg-surface-1 p-5 shadow-elev-1">
            <span className="mono-label">dados</span>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Solicitante</dt>
                <dd>{t.requesters?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Setor</dt>
                <dd>{t.sectors?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Categoria</dt>
                <dd>{t.categories?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Abertura</dt>
                <dd>
                  <Mono className="text-xs">{formatDateTime(t.created_at)}</Mono>
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Resolvido</dt>
                <dd>
                  <Mono className="text-xs">{formatDateTime(t.resolved_at)}</Mono>
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Encerrado</dt>
                <dd>
                  <Mono className="text-xs">{formatDateTime(t.closed_at)}</Mono>
                </dd>
              </div>
            </dl>
          </section>

          <section className="space-y-3 rounded-2xl bg-surface-1 p-5 shadow-elev-1">
            <div className="space-y-1.5">
              <Label htmlFor="tech">Técnico responsável</Label>
              <select
                id="tech"
                className={selectClass}
                value={t.technician_id ?? ""}
                onChange={(e) => assign(e.target.value)}
                disabled={busy}
              >
                <option value="">Não atribuído</option>
                {(techniciansQ.data ?? []).map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className={selectClass}
                value={t.status}
                onChange={(e) => changeStatus(e.target.value as TicketStatus)}
                disabled={busy}
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {t.status !== "resolvido" && t.status !== "encerrado" && (
            <section className="space-y-2 rounded-2xl bg-surface-1 p-5 shadow-elev-1">
              <span className="mono-label">resolver</span>
              <Textarea
                rows={3}
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Solução aplicada"
              />
              <Button className="w-full" onClick={resolve} disabled={busy}>
                Marcar como resolvido
              </Button>
            </section>
          )}

          {t.status !== "encerrado" && (
            <section className="space-y-2 rounded-2xl bg-surface-1 p-5 shadow-elev-1">
              <span className="mono-label">encerrar</span>
              <p className="text-xs text-muted-foreground">
                O encerramento finaliza o chamado, com ou sem resolução.
              </p>
              <select
                className={selectClass}
                value={reasonId}
                onChange={(e) => setReasonId(e.target.value)}
              >
                <option value="">Sem motivo de não resolução</option>
                {(reasonsQ.data ?? []).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <Textarea
                rows={2}
                value={finalNote}
                onChange={(e) => setFinalNote(e.target.value)}
                placeholder="Observação final (opcional)"
              />
              <Button variant="outline" className="w-full" onClick={close} disabled={busy}>
                Encerrar chamado
              </Button>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
