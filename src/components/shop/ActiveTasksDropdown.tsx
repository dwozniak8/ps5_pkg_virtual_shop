import {
  Accordion,
  AccordionControlProps,
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Drawer,
  Group,
  Progress,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  ArrowsClockwiseIcon,
  BroomIcon,
  CheckCircleIcon,
  ClockIcon,
  DotsThreeIcon,
  DownloadSimpleIcon,
  IdentificationBadgeIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { TaskRecordResponse, TaskStatus } from "@/types";

dayjs.extend(relativeTime);

interface ActiveTasksDropdownProps {
  tasks: TaskRecordResponse[];
  lastUpdatedAt: string | null;
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  onDeleteTask: (taskId: string) => Promise<void>;
  deletingTaskId: string | null;
}

function getTaskPercent(downloadedGb: number, totalGb: number): number {
  if (!Number.isFinite(totalGb) || totalGb <= 0) return 0;
  return Math.min(100, Math.round((downloadedGb / totalGb) * 100));
}

function getStatusUi(status: TaskStatus): {
  label: string;
  color: string;
  icon: React.ReactNode;
} {
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        color: "green",
        icon: <CheckCircleIcon size={14} />,
      };
    case "error":
      return {
        label: "Error",
        color: "red",
        icon: <WarningCircleIcon size={14} />,
      };
    case "queued":
      return {
        label: "Queued",
        color: "gray",
        icon: <ClockIcon size={14} />,
      };
    default:
      return {
        label: "Downloading",
        color: "blue",
        icon: <DownloadSimpleIcon size={14} />,
      };
  }
}

function getGroupStatus(task: TaskRecordResponse): TaskStatus {
  const statuses = new Set(task.items.map((item) => item.status));
  if (statuses.has(TaskStatus.DOWNLOADING)) return TaskStatus.DOWNLOADING;
  if (statuses.has(TaskStatus.ERROR)) return TaskStatus.ERROR;
  if (statuses.has(TaskStatus.QUEUED)) return TaskStatus.QUEUED;
  return TaskStatus.COMPLETED;
}

export function ActiveTasksDropdown({
  tasks,
  lastUpdatedAt,
  onRefresh,
  refreshing,
  onDeleteTask,
  deletingTaskId,
}: ActiveTasksDropdownProps) {
  const [opened, setOpened] = useState(false);
  const [expandedTextKeys, setExpandedTextKeys] = useState<
    Record<string, boolean>
  >({});

  const toggleTextExpanded = (key: string) => {
    setExpandedTextKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleRefresh = async () => {
    await onRefresh();
  };

  const lastUpdatedLabel =
    lastUpdatedAt && dayjs(lastUpdatedAt).isValid()
      ? dayjs(lastUpdatedAt).fromNow()
      : "-";

  return (
    <>
      <Button variant="light" onClick={() => setOpened(true)}>
        Active tasks
      </Button>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <Group justify="space-between" wrap="nowrap" w="100%" pr="md">
            <Text fw={600}>Active tasks</Text>
            <Group gap="xs" wrap="nowrap">
              <Text size="xs" c="dimmed">
                Last update {lastUpdatedLabel}
              </Text>
              <ActionIcon
                variant="subtle"
                aria-label="Refresh active tasks"
                onClick={() => void handleRefresh()}
                loading={refreshing}
              >
                <ArrowsClockwiseIcon size={16} />
              </ActionIcon>
            </Group>
          </Group>
        }
        position="right"
        size="md"
      >
        <Stack gap="xs">
          {tasks.length === 0 ? (
            <Text size="sm" c="dimmed">
              No active tasks
            </Text>
          ) : (
            <Accordion variant="separated" multiple>
              {tasks.map((task) => {
                const groupTextKey = `group-${task.task_id}`;
                const isGroupTitleExpanded = Boolean(
                  expandedTextKeys[groupTextKey],
                );
                const totalDownloaded = task.items.reduce(
                  (sum, item) => sum + item.downloaded_gb,
                  0,
                );
                const totalSize = task.items.reduce(
                  (sum, item) => sum + item.total_gb,
                  0,
                );
                const percent = getTaskPercent(totalDownloaded, totalSize);
                const statusUi = getStatusUi(getGroupStatus(task));

                return (
                  <Accordion.Item key={task.task_id} value={task.task_id}>
                    <Accordion.Control>
                      <Group align="flex-start" wrap="nowrap" gap="sm">
                        <ThemeIcon
                          variant="light"
                          color={statusUi.color}
                          size="md"
                        >
                          {statusUi.icon}
                        </ThemeIcon>
                        <Stack gap={2} flex={1} miw={0}>
                          <Text
                            size="sm"
                            fw={500}
                            truncate={isGroupTitleExpanded ? undefined : "end"}
                            style={{
                              cursor: "pointer",
                              whiteSpace: isGroupTitleExpanded
                                ? "normal"
                                : undefined,
                              overflowWrap: isGroupTitleExpanded
                                ? "anywhere"
                                : undefined,
                              wordBreak: isGroupTitleExpanded
                                ? "break-word"
                                : undefined,
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleTextExpanded(groupTextKey);
                            }}
                          >
                            {task.title}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {totalDownloaded.toFixed(1)} /{" "}
                            {totalSize.toFixed(1)} GB ({percent}%)
                          </Text>
                          <Badge
                            size="xs"
                            color={statusUi.color}
                            variant="light"
                            w="fit-content"
                          >
                            {statusUi.label}
                          </Badge>
                        </Stack>
                      </Group>
                      <Progress
                        value={percent}
                        size="xs"
                        mt="xs"
                        color={statusUi.color}
                      />
                    </Accordion.Control>
                    <Group p="xs" justify="center">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label="Delete task"
                        onClick={() => {
                          void onDeleteTask(task.task_id);
                        }}
                        loading={deletingTaskId === task.task_id}
                      >
                        <IdentificationBadgeIcon size={14} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label="Delete task"
                        onClick={() => {
                          void onDeleteTask(task.task_id);
                        }}
                        loading={deletingTaskId === task.task_id}
                      >
                        <BroomIcon size={14} />
                      </ActionIcon>
                      {true ? (
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          aria-label="Delete task"
                          onClick={() => {
                            void onDeleteTask(task.task_id);
                          }}
                          loading={deletingTaskId === task.task_id}
                        >
                          <PlayIcon size={14} />
                        </ActionIcon>
                      ) : (
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          aria-label="Delete task"
                          onClick={() => {
                            void onDeleteTask(task.task_id);
                          }}
                          loading={deletingTaskId === task.task_id}
                        >
                          <PauseIcon size={14} />
                        </ActionIcon>
                      )}

                      <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label="Delete task"
                        onClick={() => {
                          void onDeleteTask(task.task_id);
                        }}
                        loading={deletingTaskId === task.task_id}
                      >
                        <TrashIcon size={14} />
                      </ActionIcon>
                    </Group>

                    <Accordion.Panel>
                      <Stack gap="xs">
                        {task.items.map((item) => {
                          const itemTextKey = `item-${item.id}`;
                          const isItemTitleExpanded = Boolean(
                            expandedTextKeys[itemTextKey],
                          );
                          const itemPercent = getTaskPercent(
                            item.downloaded_gb,
                            item.total_gb,
                          );
                          const itemStatusUi = getStatusUi(item.status);

                          return (
                            <Box key={item.id} p="xs">
                              <Group align="flex-start" wrap="nowrap" gap="sm">
                                <ThemeIcon
                                  variant="light"
                                  color={itemStatusUi.color}
                                  size="sm"
                                >
                                  {itemStatusUi.icon}
                                </ThemeIcon>
                                <Stack gap={2} flex={1} miw={0}>
                                  <Text
                                    size="sm"
                                    truncate={
                                      isItemTitleExpanded ? undefined : "end"
                                    }
                                    style={{
                                      cursor: "pointer",
                                      whiteSpace: isItemTitleExpanded
                                        ? "normal"
                                        : undefined,
                                      overflowWrap: isItemTitleExpanded
                                        ? "anywhere"
                                        : undefined,
                                      wordBreak: isItemTitleExpanded
                                        ? "break-word"
                                        : undefined,
                                    }}
                                    onClick={() =>
                                      toggleTextExpanded(itemTextKey)
                                    }
                                  >
                                    {item.title}
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    {item.downloaded_gb.toFixed(1)} /{" "}
                                    {item.total_gb.toFixed(1)} GB ({itemPercent}
                                    %)
                                  </Text>
                                </Stack>
                              </Group>
                              <Progress
                                value={itemPercent}
                                size="xs"
                                mt="xs"
                                color={itemStatusUi.color}
                              />
                            </Box>
                          );
                        })}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
