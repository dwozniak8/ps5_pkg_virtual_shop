import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { CreateTaskFileInput, TaskRecordResponse, TaskStatus } from "@/types";

const TASK_DATA_FILE = path.join(process.cwd(), "taskData.json");

interface CreateTaskGroupInput {
  files: CreateTaskFileInput[];
  urls: string[];
  passwords: string[];
}

interface LegacyFlatTask {
  id: string;
  title: string;
  downloaded_gb: number;
  total_gb: number;
  status: TaskStatus;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

function buildTaskGroup(
  input: CreateTaskGroupInput,
  now: string,
): TaskRecordResponse {
  const fileItems = input.files.map((file) => ({
    id: randomUUID(),
    title: file.name,
    downloaded_gb: 0,
    total_gb: file.size_gb ?? 0,
    status: TaskStatus.QUEUED,
    icon: "file",
    source: "file" as const,
    file_name: file.name,
    url: null,
    created_at: now,
    updated_at: now,
  }));

  const urlItems = input.urls.map((url) => ({
    id: randomUUID(),
    title: url,
    downloaded_gb: 0,
    total_gb: 0,
    status: TaskStatus.QUEUED,
    icon: "url",
    source: "url" as const,
    file_name: null,
    url,
    created_at: now,
    updated_at: now,
  }));

  const items = [...fileItems, ...urlItems];
  const groupTitle =
    items.length === 1
      ? items[0].title
      : `Task ${now.slice(11, 19)} (${items.length} items)`;

  return {
    task_id: randomUUID(),
    title: groupTitle,
    passwords: input.passwords,
    items,
    created_at: now,
    updated_at: now,
  };
}

function ensureTaskDataFile(): void {
  if (!fs.existsSync(TASK_DATA_FILE)) {
    fs.writeFileSync(TASK_DATA_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function parseTaskData(raw: string): TaskRecordResponse[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    if (
      parsed.length === 0 ||
      (typeof parsed[0] === "object" &&
        "task_id" in parsed[0] &&
        "items" in parsed[0])
    ) {
      return parsed as TaskRecordResponse[];
    }

    const legacy = parsed as LegacyFlatTask[];
    return legacy.map((item) => ({
      task_id: item.id,
      title: item.title,
      passwords: [],
      items: [
        {
          id: item.id,
          title: item.title,
          downloaded_gb: item.downloaded_gb,
          total_gb: item.total_gb,
          status: item.status,
          icon: item.icon,
          source: "file",
          file_name: item.title,
          url: null,
          created_at: item.created_at,
          updated_at: item.updated_at,
        },
      ],
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  } catch {
    return [];
  }
}

function readTaskData(): TaskRecordResponse[] {
  ensureTaskDataFile();
  const raw = fs.readFileSync(TASK_DATA_FILE, "utf-8");
  return parseTaskData(raw);
}

function writeTaskData(tasks: TaskRecordResponse[]): void {
  ensureTaskDataFile();
  fs.writeFileSync(TASK_DATA_FILE, JSON.stringify(tasks, null, 2), "utf-8");
}

export function listTasks(): TaskRecordResponse[] {
  const tasks = readTaskData();
  return tasks.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function createTaskGroup(
  input: CreateTaskGroupInput,
): TaskRecordResponse {
  const tasks = readTaskData();
  const now = new Date().toISOString();

  const task = buildTaskGroup(input, now);

  tasks.push(task);
  writeTaskData(tasks);
  return task;
}

export function deleteTask(taskId: string): boolean {
  const tasks = readTaskData();
  const filtered = tasks.filter((task) => task.task_id !== taskId);

  if (filtered.length === tasks.length) {
    return false;
  }

  writeTaskData(filtered);
  return true;
}
