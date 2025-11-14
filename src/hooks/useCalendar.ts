import { useQuery } from "@tanstack/react-query";
import { fetchCalendarEvents } from "@/api/calendar";

export const useCalendarEvents = (filters = {}, options?: any) => {
  return useQuery({
    queryKey: ["calendar", "events", filters],
    queryFn: () => fetchCalendarEvents(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};
