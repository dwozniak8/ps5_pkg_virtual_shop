import {
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { AgentInfoResponse } from "@/types";

interface AgentStatusCardProps {
  agentInfo: AgentInfoResponse | null;
}

function StatusIndicator({ ok }: { ok: boolean }) {
  return (
    <ThemeIcon variant="transparent" color={ok ? "green" : "red"} size="sm">
      {ok ? (
        <CheckCircleIcon size={16} weight="fill" />
      ) : (
        <XCircleIcon size={16} weight="fill" />
      )}
    </ThemeIcon>
  );
}

export function AgentStatusCard({ agentInfo }: AgentStatusCardProps) {
  if (!agentInfo)
    return (
      <Center>
        <Loader size="sm" />
      </Center>
    );

  return (
    <Card withBorder>
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            CURRENT DEVICE
          </Text>
          <Text size="xs">{agentInfo.current_device ?? "Unknown Device"}</Text>
        </Group>
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            DEVICE STREAM
          </Text>
          <StatusIndicator ok={agentInfo.device_stream_ok} />
        </Group>
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            DOWNLOADER
          </Text>
          <StatusIndicator ok={agentInfo.downloader_ok} />
        </Group>
      </Stack>
    </Card>
  );
}
