import { useQuery } from "@tanstack/react-query";
import { getAutomations } from "../api";

export function useAutomations() {
  return useQuery({
    queryKey: ["automations"],
    queryFn: getAutomations,
    staleTime: 5 * 60_000,
  });
}
