import { useMutation } from "@tanstack/react-query";
import { useIpAddress } from "@/hooks/useIpAddress";
import { sendPkgToInstaller } from "./installUtils";

export function useInstallPkgMutation() {
  const localIp = useIpAddress();

  return useMutation({
    mutationFn: async (installUrl: string) => {
      await sendPkgToInstaller(localIp, installUrl);
    },
  });
}
