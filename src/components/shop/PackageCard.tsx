import { Badge, Button, Card, Group, Image, Stack, Text } from "@mantine/core";
import { ShopItem } from "@/types";

interface PackageCardResolvedProps {
  item: ShopItem;
  onOpenDetails: (item: ShopItem) => void;
}

export function PackageCard({ item, onOpenDetails }: PackageCardResolvedProps) {
  const title = item.is_pack
    ? item.title
    : (item.title ?? item.content_id ?? "Unknown");

  return (
    <Card withBorder>
      <Card.Section>
        {item.image_path ? (
          <Image src={item.image_path} alt={title} h={180} fit="cover" />
        ) : (
          <Stack p="md" align="center" justify="center" h={180}>
            <Text c="dimmed">No Image</Text>
          </Stack>
        )}
      </Card.Section>

      <Stack gap="xs" mt="sm" h="100%">
        <Text fw={500} lineClamp={2}>
          {title}
        </Text>

        <Group gap="xs">
          <Badge variant="light">{item.file_size_str}</Badge>
          {item.is_pack && <Badge color="blue">PACK</Badge>}
        </Group>

        <Button variant="default" onClick={() => onOpenDetails(item)} mt="auto">
          Details
        </Button>
      </Stack>
    </Card>
  );
}
