const TEAM_COLORS: Record<string, string> = {
  mercedes: "#00D2BE",
  ferrari: "#DC0000",
  mclaren: "#FF8700",
  red_bull: "#3671C6",
  alpine: "#0093CC",
  williams: "#005AFF",
  haas: "#B6BABD",
  rb: "#4E7FFF",
  aston_martin: "#229971",
  audi: "#1A1A1A",
  cadillac: "#555555",
};

export function getTeamColor(constructorId: string): string {
  return TEAM_COLORS[constructorId] || "#6B7280";
}
