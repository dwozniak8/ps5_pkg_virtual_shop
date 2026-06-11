import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteTaskResponse } from "@/types";
import { shopQueryKeys } from "@/queries";

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      return (await response.json()) as DeleteTaskResponse;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: shopQueryKeys.tasks });
    },
  });
}
