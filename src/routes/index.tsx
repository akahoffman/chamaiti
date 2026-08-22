import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Terminal, ShieldCheck, Activity } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Central de Chamados de TI — Gestão interna" },
      {
        name: "description",
        content:
          "Sistema interno para registrar, acompanhar e encerrar chamados de TI com histórico completo.",
      },
      { property: "og:title", content: "Central de Chamados de TI" },
      {
        property: "og:description",
        content: "Registre, acompanhe e encerre chamados de TI com histórico completo.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-2xl">
        <span className="mono-label">helpdesk // ti interna</span>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Central de Chamados de TI
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Ferramenta de trabalho da equipe de TI: abertura, triagem, atendimento e encerramento de
          chamados, com histórico cronológico e anexos. Solicitantes não possuem acesso — o registro
          é sempre feito pela equipe.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {signedIn ? (
            <Button asChild size="lg">
              <Link to="/dashboard">Abrir painel</Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link to="/auth">Entrar</Link>
            </Button>
          )}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Terminal, title: "Registro rápido", desc: "Abertura em poucos campos." },
            { icon: Activity, title: "Rastreabilidade", desc: "Histórico de cada evento." },
            { icon: ShieldCheck, title: "Acesso restrito", desc: "Somente equipe autenticada." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl bg-surface-1 p-4 shadow-elev-1">
              <f.icon className="size-5 text-primary" />
              <h2 className="mt-3 text-sm font-semibold text-foreground">{f.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
