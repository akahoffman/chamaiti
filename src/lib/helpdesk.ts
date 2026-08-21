export type TicketStatus =
  | "aberto"
  | "em_triagem"
  | "em_atendimento"
  | "aguardando_solicitante"
  | "aguardando_terceiro"
  | "resolvido"
  | "encerrado"
  | "cancelado";

export type TicketUrgency = "baixa" | "normal" | "alta" | "critica";

export const STATUS_LABEL: Record<TicketStatus, string> = {
  aberto: "Aberto",
  em_triagem: "Em triagem",
  em_atendimento: "Em atendimento",
  aguardando_solicitante: "Aguardando solicitante",
  aguardando_terceiro: "Aguardando terceiro",
  resolvido: "Resolvido",
  encerrado: "Encerrado",
  cancelado: "Cancelado",
};

export const STATUS_ORDER: TicketStatus[] = [
  "aberto",
  "em_triagem",
  "em_atendimento",
  "aguardando_solicitante",
  "aguardando_terceiro",
  "resolvido",
  "encerrado",
  "cancelado",
];

export const URGENCY_LABEL: Record<TicketUrgency, string> = {
  baixa: "Baixa",
  normal: "Normal",
  alta: "Alta",
  critica: "Crítica",
};

export const URGENCY_DESCRIPTION: Record<TicketUrgency, string> = {
  baixa: "Pode aguardar sem impacto significativo.",
  normal: "Atendimento comum.",
  alta: "Impacta o trabalho do setor.",
  critica: "Paralisa atividade, equipamento ou sistema essencial.",
};

export const URGENCY_ORDER: TicketUrgency[] = ["baixa", "normal", "alta", "critica"];

export const URGENCY_RANK: Record<TicketUrgency, number> = {
  baixa: 1,
  normal: 2,
  alta: 3,
  critica: 4,
};

export const OPEN_STATUSES: TicketStatus[] = [
  "aberto",
  "em_triagem",
  "em_atendimento",
  "aguardando_solicitante",
  "aguardando_terceiro",
];

export const WAITING_STATUSES: TicketStatus[] = [
  "aguardando_solicitante",
  "aguardando_terceiro",
];

export function ticketNumber(n: string | null | undefined) {
  return n ? `#${n}` : "#—";
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(value: string | null | undefined) {
  if (!value) return "--:--:--";
  return new Date(value).toLocaleTimeString("pt-BR", { hour12: false });
}

export function formatDuration(ms: number | null) {
  if (ms === null || Number.isNaN(ms)) return "—";
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours < 24) return `${hours}h ${rest}min`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

export const HISTORY_LABEL: Record<string, string> = {
  criacao: "Abertura",
  status: "Status",
  tecnico: "Técnico",
  comentario: "Comentário",
  solucao: "Solução",
};
