import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTaskRequest, CreateTaskResponse } from "@/types";
import { shopQueryKeys } from "@/queries";

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTaskRequest) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      return (await response.json()) as CreateTaskResponse;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: shopQueryKeys.tasks });
    },
  });
}
