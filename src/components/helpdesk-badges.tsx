import { cn } from "@/lib/utils";
import {
  STATUS_LABEL,
  URGENCY_LABEL,
  type TicketStatus,
  type TicketUrgency,
} from "@/lib/helpdesk";

const STATUS_CLASS: Record<TicketStatus, string> = {
  aberto: "bg-info/15 text-info",
  em_triagem: "bg-primary/15 text-primary",
  em_atendimento: "bg-primary-container text-primary-container-foreground",
  aguardando_solicitante: "bg-warning/15 text-warning",
  aguardando_terceiro: "bg-warning/15 text-warning",
  resolvido: "bg-success/15 text-success",
  encerrado: "bg-surface-4 text-muted-foreground",
  cancelado: "bg-destructive/15 text-destructive",
};

const URGENCY_CLASS: Record<TicketUrgency, string> = {
  baixa: "bg-urgency-low/15 text-urgency-low",
  normal: "bg-urgency-normal/15 text-urgency-normal",
  alta: "bg-urgency-high/15 text-urgency-high",
  critica: "bg-urgency-critical/20 text-urgency-critical",
};

const base =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  return <span className={cn(base, STATUS_CLASS[status], className)}>{STATUS_LABEL[status]}</span>;
}

export function UrgencyBadge({
  urgency,
  className,
}: {
  urgency: TicketUrgency;
  className?: string;
}) {
  return (
    <span className={cn(base, URGENCY_CLASS[urgency], className)}>{URGENCY_LABEL[urgency]}</span>
  );
}

export function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-mono text-sm tracking-tight", className)}>{children}</span>;
}
