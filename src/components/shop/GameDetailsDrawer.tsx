import {
  Badge,
  Button,
  Code,
  Divider,
  Drawer,
  Group,
  Image,
  List,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { PackSubItem, ShopItem } from "@/types";
import { formatCategoryType } from "../../utils/formatCategoryType";

interface GameDetailsDrawerProps {
  opened: boolean;
  item: ShopItem | null;
  onClose: () => void;
  onInstallOne: (installUrl: string) => void;
  onInstallAll: (installUrls: PackSubItem[]) => void;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "Unknown";
  return new Intl.NumberFormat("en-US").format(bytes);
}

export function GameDetailsDrawer({
  opened,
  item,
  onClose,
  onInstallOne,
  onInstallAll,
}: GameDetailsDrawerProps) {
  const title = item
    ? item.is_pack
      ? item.title
      : (item.title ?? item.content_id ?? "Unknown")
    : "Details";

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={title}
      position="right"
      size="md"
    >
      {!item ? null : (
        <Stack>
          {item.image_path ? (
            <Image src={item.image_path} alt={title} radius="sm" />
          ) : null}

          <Group gap="xs">
            <Badge variant="light">{item.file_size_str}</Badge>
            {item.is_pack ? <Badge color="blue">PACK</Badge> : null}
            <Badge variant="outline">
              {formatCategoryType(item.category_type)}
            </Badge>
          </Group>

          <Stack gap={4}>
            <Title order={6}>Metadata</Title>
            <Text size="sm">Category: {item.category}</Text>
            <Text size="sm">
              Size (bytes): {formatBytes(item.file_size_bytes)}
            </Text>
            {!item.is_pack ? (
              <>
                <Text size="sm">Content ID:</Text>
                <Code block>{item.content_id ?? "Unknown"}</Code>
                <Text size="sm">File path:</Text>
                <Code block>{item.file_path}</Code>
                <Text size="sm">Install URL:</Text>
                <Code block>{item.install_url}</Code>
              </>
            ) : (
              <Text size="sm">Items count: {item.items.length}</Text>
            )}
          </Stack>

          {!item.is_pack ? (
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Ready to install selected package.
              </Text>
              <Button onClick={() => onInstallOne(item.install_url)}>
                Install
              </Button>
            </Stack>
          ) : (
            <Stack gap="sm">
              <Title order={5}>Pack items</Title>
              <List spacing="xs">
                {item.items.map((subItem, index) => (
                  <List.Item key={`${subItem.install_url}-${index}`}>
                    <Stack gap={4}>
                      <Group justify="space-between" wrap="nowrap">
                        <Text size="sm">
                          {subItem.title ?? "Unknown"} (
                          {formatCategoryType(subItem.category_type)})
                        </Text>
                        <Button
                          variant="light"
                          size="xs"
                          onClick={() => onInstallOne(subItem.install_url)}
                        >
                          Install
                        </Button>
                      </Group>
                      <Code block>{subItem.install_url}</Code>
                      <Code block>{subItem.file_path}</Code>
                    </Stack>
                  </List.Item>
                ))}
              </List>
              <Divider />
              <Button onClick={() => onInstallAll(item.items)}>
                Install All
              </Button>
            </Stack>
          )}
        </Stack>
      )}
    </Drawer>
  );
}
