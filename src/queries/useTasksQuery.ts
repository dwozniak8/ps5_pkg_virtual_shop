import { useQuery } from "@tanstack/react-query";
import { TasksListResponse } from "@/types";
import { fetchJson } from "./fetchJson";
import { shopQueryKeys } from "./queryKeys";

export function useTasksQuery() {
  return useQuery({
    queryKey: shopQueryKeys.tasks,
    queryFn: () => fetchJson<TasksListResponse>("/api/tasks"),
  });
}
