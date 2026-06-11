import { useMutation } from "@tanstack/react-query";
import { useIpAddress } from "@/hooks/useIpAddress";
import { PackSubItem } from "@/types";
import { sendPkgToInstaller } from "./installUtils";

export function useInstallAllPkgsMutation() {
  const localIp = useIpAddress();

  return useMutation({
    mutationFn: async (items: PackSubItem[]) => {
      for (const item of items) {
        if (!item.install_url) continue;
        await sendPkgToInstaller(localIp, item.install_url);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    },
  });
}
