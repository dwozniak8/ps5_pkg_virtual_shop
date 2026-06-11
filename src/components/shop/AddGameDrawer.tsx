import {
  Button,
  Drawer,
  FileInput,
  Stack,
  Textarea,
  Typography,
} from "@mantine/core";
import { useState } from "react";

export interface AddGameFormValues {
  files: File[];
  links: string;
  passwords: string;
}

interface AddGameDrawerProps {
  opened: boolean;
  onClose: () => void;
  onSave: (values: AddGameFormValues) => void;
}

export function AddGameDrawer({ opened, onClose, onSave }: AddGameDrawerProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [links, setLinks] = useState("");
  const [passwords, setPasswords] = useState("");

  const handleSave = () => {
    onSave({ files, links, passwords });
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Download"
      position="right"
      size="md"
    >
      <Stack>
        <FileInput
          label="Select files (.dlc)"
          value={files}
          onChange={(value) => setFiles(Array.isArray(value) ? value : [])}
          multiple
          clearable
        />
        <Stack gap="xs">
          {files.map((file) => (
            <Typography key={file.name}>{file.name}</Typography>
          ))}
        </Stack>

        <Textarea
          label="Download links (one per line)"
          minRows={4}
          value={links}
          onChange={(event) => setLinks(event.currentTarget.value)}
        />

        <Textarea
          label="append password to storage (one per line)"
          minRows={3}
          value={passwords}
          onChange={(event) => setPasswords(event.currentTarget.value)}
        />

        <Button onClick={handleSave}>Zapisz</Button>
      </Stack>
    </Drawer>
  );
}
