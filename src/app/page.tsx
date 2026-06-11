"use client";

import {
  Affix,
  AppShell,
  Box,
  Button,
  Center,
  Loader,
  Notification,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useCallback, useState } from "react";
import { useElementHeight } from "@/hooks/useElementHeight";
import { AgentStatusCard } from "@/components/shop/AgentStatusCard";
import {
  AddGameDrawer,
  AddGameFormValues,
} from "@/components/shop/AddGameDrawer";
import { ActiveTasksDropdown } from "@/components/shop/ActiveTasksDropdown";
import { GameDetailsDrawer } from "@/components/shop/GameDetailsDrawer";
import { PackageCard } from "@/components/shop/PackageCard";
import { PaginationControls } from "@/components/shop/PaginationControls";
import { SearchBar } from "@/components/shop/SearchBar";
import { PackSubItem, ShopItem } from "@/types";
import {
  useAgentInfoQuery,
  useItemsQuery,
  useScanQuery,
  useSearchQuery,
  useShopSettingsQuery,
  useTasksQuery,
} from "@/queries";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useInstallAllPkgsMutation,
  useInstallPkgMutation,
} from "@/mutations";

export default function ShopPage() {
  const [searchInput, setSearchInput] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [activeQuery, setActiveQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsItem, setDetailsItem] = useState<ShopItem | null>(null);
  const [addGameOpened, setAddGameOpened] = useState(false);
  const [isRefreshingGames, setIsRefreshingGames] = useState(false);
  const [isRefreshingTasks, setIsRefreshingTasks] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const { elementRef: mobileHeaderRef, height: mobileHeaderHeight } =
    useElementHeight<HTMLDivElement>(320);

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const settingsQuery = useShopSettingsQuery();
  const agentQuery = useAgentInfoQuery();
  const scanQuery = useScanQuery();
  const tasksQuery = useTasksQuery();

  const scanReady = scanQuery.isSuccess;

  const itemsQuery = useItemsQuery(currentPage, scanReady && !isSearchMode);
  const searchQuery = useSearchQuery(
    activeQuery,
    currentPage,
    scanReady && isSearchMode && activeQuery.length > 0,
  );

  const installPkgMutation = useInstallPkgMutation();
  const installAllPkgsMutation = useInstallAllPkgsMutation();
  const createTaskMutation = useCreateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  const effectiveData = isSearchMode ? searchQuery.data : itemsQuery.data;
  const items = effectiveData?.items ?? [];
  const totalPages = effectiveData?.total_pages ?? 1;

  const isLoadingData =
    scanQuery.isPending ||
    (isSearchMode ? searchQuery.isPending : itemsQuery.isPending);

  const shopTitle = settingsQuery.data?.shop_title ?? "PS5 PKG Virtual Shop";
  const activeTasks = tasksQuery.data?.tasks ?? [];
  const tasksLastUpdatedAt = tasksQuery.data?.last_updated_at ?? null;
  const downloaderOk = agentQuery.data?.downloader_ok ?? false;

  const handleSearch = useCallback(() => {
    const query = searchInput.trim();
    if (!query) return;
    setIsSearchMode(true);
    setActiveQuery(query);
    setCurrentPage(1);
  }, [searchInput]);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setIsSearchMode(false);
    setActiveQuery("");
    setCurrentPage(1);
  }, []);

  const handleInstallPkg = useCallback(
    async (installUrl: string) => {
      showToast("Sending command to PS5…", true);
      try {
        await installPkgMutation.mutateAsync(installUrl);
        showToast("Download started on PS5!", true);
      } catch {
        showToast("Failed! Please enable etaHEN / DPI v2.", false);
      }
    },
    [installPkgMutation, showToast],
  );

  const handleInstallAllPkgs = useCallback(
    async (itemsToInstall: PackSubItem[]) => {
      try {
        await installAllPkgsMutation.mutateAsync(itemsToInstall);
        showToast(`All ${itemsToInstall.length} downloads started!`, true);
      } catch {
        showToast("Failed! Please enable etaHEN / DPI v2.", false);
      }
    },
    [installAllPkgsMutation, showToast],
  );

  const handleRefreshGames = useCallback(async () => {
    setIsRefreshingGames(true);
    try {
      await scanQuery.refetch();

      if (isSearchMode && activeQuery.length > 0) {
        await searchQuery.refetch();
      } else {
        await itemsQuery.refetch();
      }

      showToast("Games list refreshed.", true);
    } catch {
      showToast("Failed to refresh games list.", false);
    } finally {
      setIsRefreshingGames(false);
    }
  }, [
    activeQuery.length,
    isSearchMode,
    itemsQuery,
    scanQuery,
    searchQuery,
    showToast,
  ]);

  const handleRefreshTasks = useCallback(async () => {
    setIsRefreshingTasks(true);
    try {
      await tasksQuery.refetch();
      showToast("Tasks refreshed.", true);
    } catch {
      showToast("Failed to refresh tasks.", false);
    } finally {
      setIsRefreshingTasks(false);
    }
  }, [tasksQuery, showToast]);

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      setDeletingTaskId(taskId);
      try {
        await deleteTaskMutation.mutateAsync(taskId);
        showToast("Task deleted.", true);
      } catch {
        showToast("Failed to delete task.", false);
      } finally {
        setDeletingTaskId(null);
      }
    },
    [deleteTaskMutation, showToast],
  );

  const handleCreateTasks = useCallback(
    async (values: AddGameFormValues) => {
      const files = values.files
        .map((file) => ({
          name: file.name.trim(),
          size_gb: Number((file.size / 1024 ** 3).toFixed(2)),
        }))
        .filter((file) => file.name.length > 0);

      const urls = values.links
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const passwords = values.passwords
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (files.length === 0 && urls.length === 0) {
        showToast("No files or links to create tasks.", false);
        return;
      }

      try {
        const response = await createTaskMutation.mutateAsync({
          files,
          urls,
          passwords,
        });

        showToast(
          `Created 1 task (${response.task.items.length} downloads).`,
          true,
        );
      } catch {
        showToast("Failed to create tasks.", false);
      }
    },
    [createTaskMutation, showToast],
  );

  return (
    <>
      <AppShell
        header={{ height: { sm: 0 } }}
        navbar={{ width: 280, breakpoint: "sm" }}
        padding="md"
      >
        <AppShell.Header ref={mobileHeaderRef} p="md" hiddenFrom="sm">
          <Stack gap="sm">
            <Title order={4}>{shopTitle}</Title>
            <SearchBar
              value={searchInput}
              isSearchMode={isSearchMode}
              onChange={setSearchInput}
              onSearch={handleSearch}
              onClear={handleClearSearch}
            />
            {downloaderOk && (
              <Button variant="light" onClick={() => setAddGameOpened(true)}>
                Download task
              </Button>
            )}
            {downloaderOk && (
              <ActiveTasksDropdown
                tasks={activeTasks}
                lastUpdatedAt={tasksLastUpdatedAt}
                onRefresh={handleRefreshTasks}
                refreshing={isRefreshingTasks}
                onDeleteTask={handleDeleteTask}
                deletingTaskId={deletingTaskId}
              />
            )}
            <Button
              variant="light"
              onClick={() => void handleRefreshGames()}
              loading={isRefreshingGames}
            >
              Refresh
            </Button>
          </Stack>
        </AppShell.Header>

        <AppShell.Navbar p="md" visibleFrom="sm">
          <Stack>
            <Title order={3}>{shopTitle}</Title>

            <AgentStatusCard agentInfo={agentQuery.data || null} />

            <SearchBar
              value={searchInput}
              isSearchMode={isSearchMode}
              onChange={setSearchInput}
              onSearch={handleSearch}
              onClear={handleClearSearch}
            />

            {downloaderOk && (
              <Button variant="light" onClick={() => setAddGameOpened(true)}>
                Download task
              </Button>
            )}
            {downloaderOk && (
              <ActiveTasksDropdown
                tasks={activeTasks}
                lastUpdatedAt={tasksLastUpdatedAt}
                onRefresh={handleRefreshTasks}
                refreshing={isRefreshingTasks}
                onDeleteTask={handleDeleteTask}
                deletingTaskId={deletingTaskId}
              />
            )}
            <Button
              variant="light"
              onClick={() => void handleRefreshGames()}
              loading={isRefreshingGames}
            >
              Refresh
            </Button>
          </Stack>
        </AppShell.Navbar>

        <AppShell.Main>
          <Stack>
            <Box hiddenFrom="sm" h={mobileHeaderHeight} />

            {isLoadingData ? (
              <Center h={360}>
                <Loader />
              </Center>
            ) : (
              <>
                {isSearchMode && (
                  <Text size="sm" c="dimmed">
                    Search results for: {activeQuery}
                  </Text>
                )}

                {items.length === 0 ? (
                  <Text c="dimmed">No packages found.</Text>
                ) : (
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                    {items.map((item, index) => (
                      <PackageCard
                        key={`${item.install_url ?? item.title ?? "item"}-${index}`}
                        item={item}
                        onOpenDetails={(selectedItem) =>
                          setDetailsItem(selectedItem)
                        }
                      />
                    ))}
                  </SimpleGrid>
                )}

                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  onNext={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                />
              </>
            )}
          </Stack>
        </AppShell.Main>
      </AppShell>

      <GameDetailsDrawer
        opened={detailsItem !== null}
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
        onInstallOne={(installUrl) => void handleInstallPkg(installUrl)}
        onInstallAll={(itemsToInstall) =>
          void handleInstallAllPkgs(itemsToInstall)
        }
      />

      <AddGameDrawer
        opened={addGameOpened}
        onClose={() => setAddGameOpened(false)}
        onSave={(values) => void handleCreateTasks(values)}
      />

      {toast && (
        <Affix position={{ bottom: 20, right: 20 }}>
          <Notification
            withCloseButton={false}
            color={toast.ok ? "green" : "red"}
          >
            {toast.msg}
          </Notification>
        </Affix>
      )}
    </>
  );
}
