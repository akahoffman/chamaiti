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
  component: NewTicket;
});

function NewTicket() {
  return null;
}
