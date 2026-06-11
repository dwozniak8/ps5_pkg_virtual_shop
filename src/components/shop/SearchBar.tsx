import { ActionIcon, Group, TextInput } from "@mantine/core";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react/dist/ssr";

interface SearchBarProps {
  value: string;
  isSearchMode: boolean;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

export function SearchBar({
  value,
  isSearchMode,
  onChange,
  onSearch,
  onClear,
}: SearchBarProps) {
  return (
    <Group gap="xs" align="end" wrap="nowrap">
      <TextInput
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSearch();
        }}
        placeholder="Search packages"
        flex={1}
        size="sm"
      />
      <ActionIcon
        size="input-sm"
        variant="default"
        onClick={onSearch}
        aria-label="Search"
      >
        <MagnifyingGlassIcon />
      </ActionIcon>
      {isSearchMode && (
        <ActionIcon
          size="input-sm"
          variant="default"
          onClick={onClear}
          aria-label="Clear"
        >
          <XIcon />
        </ActionIcon>
      )}
    </Group>
  );
}
