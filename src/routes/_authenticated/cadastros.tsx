import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/cadastros")({
  head: () => ({
    meta: [
      { title: "Cadastros — Central de Chamados de TI" },
      {
        name: "description",
        content: "Gerenciar setores, categorias, solicitantes, técnicos e motivos.",
      },
      { property: "og:title", content: "Cadastros — Central de Chamados de TI" },
      { property: "og:description", content: "Catálogos de apoio ao atendimento de TI." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CadastrosPage,
});

type Tab = "sectors" | "categories" | "requesters" | "technicians" | "unresolved_reasons";

const TABS: { key: Tab; label: string }[] = [
  { key: "requesters", label: "Solicitantes" },
  { key: "sectors", label: "Setores" },
  { key: "categories", label: "Categorias" },
  { key: "technicians", label: "Técnicos" },
  { key: "unresolved_reasons", label: "Motivos de não resolução" },
];

function CadastrosPage() {
  const [tab, setTab] = useState<Tab>("requesters");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <span className="mono-label">cadastros</span>
        <h1 className="text-2xl font-semibold text-foreground">Catálogos do sistema</h1>
        <p className="text-sm text-muted-foreground">
          Solicitantes não possuem login — são apenas registros de referência.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t.key
                ? "bg-primary-container text-primary-container-foreground"
                : "bg-surface-2 text-muted-foreground hover:bg-surface-3",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "requesters" && <Requesters />}
      {tab === "sectors" && <SimpleList table="sectors" title="Setores" />}
      {tab === "categories" && <Categories />}
      {tab === "technicians" && <SimpleList table="technicians" title="Técnicos" />}
      {tab === "unresolved_reasons" && (
        <SimpleList table="unresolved_reasons" title="Motivos de não resolução" />
      )}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <section className="rounded-2xl bg-surface-1 p-5 shadow-elev-1">{children}</section>;
}

function SimpleList({
  table,
  title,
}: {
  table: "sectors" | "technicians" | "unresolved_reasons";
  title: string;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: [table, "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("id, name, active")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  async function add() {
    if (!name.trim()) return;
    const { error } = await supabase.from(table).insert({ name: name.trim() });
    if (error) {
      toast.error(error.message);
      return;
    }
    setName("");
    qc.invalidateQueries({ queryKey: [table] });
    toast.success("Registro criado.");
  }

  async function toggle(id: string, active: boolean) {
    const { error } = await supabase.from(table).update({ active: !active }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: [table] });
  }

  return (
    <Card>
      <span className="mono-label">{title.toLowerCase()}</span>
      <div className="mt-3 flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={`Novo ${title.toLowerCase()}`} />
        <Button onClick={add}>Adicionar</Button>
      </div>
      <ul className="mt-4 divide-y divide-border">
        {isLoading && <li className="py-3 text-sm text-muted-foreground">Carregando...</li>}
        {(data ?? []).map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-3 py-2.5">
            <span className={cn("text-sm", !row.active && "text-muted-foreground line-through")}>
              {row.name}
            </span>
            <Button variant="ghost" size="sm" onClick={() => toggle(row.id, row.active)}>
              {row.active ? "Desativar" : "Ativar"}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Categories() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");

  const { data } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, group_name, active")
        .order("group_name")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  async function add() {
    if (!name.trim() || !group.trim()) {
      toast.error("Informe grupo e categoria.");
      return;
    }
    const { error } = await supabase
      .from("categories")
      .insert({ name: name.trim(), group_name: group.trim() });
    if (error) {
      toast.error(error.message);
      return;
    }
    setName("");
    qc.invalidateQueries({ queryKey: ["categories"] });
  }

  async function toggle(id: string, active: boolean) {
    await supabase.from("categories").update({ active: !active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["categories"] });
  }

  return (
    <Card>
      <span className="mono-label">categorias</span>
      <div className="mt-3 flex flex-wrap gap-2">
        <Input
          className="max-w-[200px]"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          placeholder="Grupo"
        />
        <Input
          className="max-w-[240px]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Categoria"
        />
        <Button onClick={add}>Adicionar</Button>
      </div>
      <ul className="mt-4 divide-y divide-border">
        {(data ?? []).map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
            <span className={cn("text-sm", !c.active && "text-muted-foreground line-through")}>
              <span className="font-mono text-xs text-muted-foreground">{c.group_name} / </span>
              {c.name}
            </span>
            <Button variant="ghost" size="sm" onClick={() => toggle(c.id, c.active)}>
              {c.active ? "Desativar" : "Ativar"}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Requesters() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sectorId, setSectorId] = useState("");

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

  const { data } = useQuery({
    queryKey: ["requesters", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requesters")
        .select("id, name, phone, active, sectors(name)")
        .order("name");
      if (error) throw error;
      return (data ?? []) as unknown as {
        id: string;
        name: string;
        phone: string | null;
        active: boolean;
        sectors: { name: string } | null;
      }[];
    },
  });

  async function add() {
    if (!name.trim()) return;
    const { error } = await supabase.from("requesters").insert({
      name: name.trim(),
      phone: phone.trim() || null,
      sector_id: sectorId || null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setName("");
    setPhone("");
    qc.invalidateQueries({ queryKey: ["requesters"] });
  }

  async function toggle(id: string, active: boolean) {
    await supabase.from("requesters").update({ active: !active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["requesters"] });
  }

  return (
    <Card>
      <span className="mono-label">solicitantes</span>
      <div className="mt-3 flex flex-wrap gap-2">
        <Input
          className="max-w-[220px]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome"
        />
        <Input
          className="max-w-[160px]"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ramal / telefone"
        />
        <select
          className="h-11 rounded-xl border border-border bg-surface-2 px-3 text-sm text-foreground"
          value={sectorId}
          onChange={(e) => setSectorId(e.target.value)}
        >
          <option value="">Setor</option>
          {(sectors ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <Button onClick={add}>Adicionar</Button>
      </div>
      <ul className="mt-4 divide-y divide-border">
        {(data ?? []).map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
            <span className={cn("text-sm", !r.active && "text-muted-foreground line-through")}>
              {r.name}
              <span className="ml-2 text-xs text-muted-foreground">
                {r.sectors?.name ?? "sem setor"}
                {r.phone ? ` · ${r.phone}` : ""}
              </span>
            </span>
            <Button variant="ghost" size="sm" onClick={() => toggle(r.id, r.active)}>
              {r.active ? "Desativar" : "Ativar"}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
