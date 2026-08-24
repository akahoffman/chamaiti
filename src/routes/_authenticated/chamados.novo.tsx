import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  URGENCY_DESCRIPTION,
  URGENCY_LABEL,
  URGENCY_ORDER,
  type TicketUrgency,
} from "@/lib/helpdesk";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/chamados/novo")({
  head: () => ({
    meta: [
      { title: "Novo chamado — Central de Chamados de TI" },
      { name: "description", content: "Registrar um novo chamado de TI para um solicitante." },
      { property: "og:title", content: "Novo chamado — Central de Chamados de TI" },
      { property: "og:description", content: "Registrar um novo chamado de TI." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewTicket,
});

function NewTicket() {
  const navigate = useNavigate();
  const [requesterId, setRequesterId] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [urgency, setUrgency] = useState<TicketUrgency>("normal");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: requesters } = useQuery({
    queryKey: ["requesters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requesters")
        .select("id, name, sector_id")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: sectors } = useQuery({
    queryKey: ["sectors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sectors")
        .select("id, name")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, group_name")
        .eq("active", true)
        .order("group_name")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const groups = Array.from(new Set((categories ?? []).map((c) => c.group_name)));

  function pickRequester(id: string) {
    setRequesterId(id);
    const r = (requesters ?? []).find((x) => x.id === id);
    if (r?.sector_id) setSectorId(r.sector_id);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error("Informe o título do chamado."); return; }
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: ticket, error } = await supabase
        .from("tickets")
        .insert({
          requester_id: requesterId || null,
          sector_id: sectorId || null,
          category_id: categoryId || null,
          urgency,
          title: title.trim(),
          description: description.trim(),
          created_by: userData.user?.id ?? null,
        })
        .select("id, number")
        .single();
      if (error) throw error;

      for (const file of files) {
        const path = `${ticket.id}/${crypto.randomUUID()}-${file.name}`;
        const up = await supabase.storage.from("ticket-attachments").upload(path, file);
        if (up.error) {
          toast.error(`Falha ao enviar ${file.name}`);
          continue;
        }
        await supabase.from("ticket_attachments").insert({
          ticket_id: ticket.id,
          file_path: path,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: userData.user?.id ?? null,
        });
      }

      toast.success(`Chamado #${ticket.number} criado.`);
      navigate({ to: "/chamados/$id", params: { id: ticket.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar chamado");
    } finally {
      setSaving(false);
    }
  }

  const selectClass =
    "h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-foreground";

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
      <header>
        <span className="mono-label">novo chamado</span>
        <h1 className="text-2xl font-semibold text-foreground">Registrar atendimento</h1>
        <p className="text-sm text-muted-foreground">
          O solicitante não possui conta — o registro é feito pela equipe de TI.
        </p>
      </header>

      <div className="grid gap-4 rounded-2xl bg-surface-1 p-5 shadow-elev-1 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="requester">Solicitante</Label>
          <select
            id="requester"
            className={selectClass}
            value={requesterId}
            onChange={(e) => pickRequester(e.target.value)}
          >
            <option value="">Selecione</option>
            {(requesters ?? []).map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sector">Setor</Label>
          <select
            id="sector"
            className={selectClass}
            value={sectorId}
            onChange={(e) => setSectorId(e.target.value)}
          >
            <option value="">Selecione</option>
            {(sectors ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="category">Categoria</Label>
          <select
            id="category"
            className={selectClass}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Selecione</option>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {(categories ?? [])
                  .filter((c) => c.group_name === g)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl bg-surface-1 p-5 shadow-elev-1">
        <Label>Urgência</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {URGENCY_ORDER.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUrgency(u)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                urgency === u
                  ? "border-primary bg-primary-container text-primary-container-foreground"
                  : "border-border bg-surface-2 hover:bg-surface-3",
              )}
            >
              <span className="text-sm font-medium">{URGENCY_LABEL[u]}</span>
              <p className="text-xs opacity-80">{URGENCY_DESCRIPTION[u]}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl bg-surface-1 p-5 shadow-elev-1">
        <div className="space-y-1.5">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resumo do problema"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhe o problema, equipamento e o que já foi tentado"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="files">Anexos</Label>
          <input
            id="files"
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-surface-3 file:px-4 file:py-2 file:text-sm file:text-foreground"
          />
          {files.length > 0 && (
            <p className="font-mono text-xs text-muted-foreground">
              {files.length} arquivo(s) selecionado(s)
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Abrir chamado"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => navigate({ to: "/chamados" })}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
