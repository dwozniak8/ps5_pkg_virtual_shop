import { Button, Group, Text } from "@mantine/core";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <Group justify="center" mt="md">
      <Button variant="default" disabled={currentPage === 1} onClick={onPrev}>
        Prev
      </Button>
      <Text>
        Page {currentPage} / {totalPages}
      </Text>
      <Button
        variant="default"
        disabled={currentPage === totalPages}
        onClick={onNext}
      >
        Next
      </Button>
    </Group>
  );
}
