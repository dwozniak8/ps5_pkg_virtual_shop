import { ShopItem } from "./shop";

export enum AgentStatus {
  OK = "OK",
  STREAM_NOT_AVAILABLE = "STREAM_NOT_AVAILABLE",
}

export interface AgentInfoResponse {
  current_device: string;
  status: AgentStatus;
  device_stream_ok: boolean;
  downloader_ok: boolean;
}

export interface PagedResultResponse {
  items: ShopItem[];
  current_page: number;
  total_pages: number;
}

export interface ScanResponse {
  categories: string[];
}

export interface ShopSettingsResponse {
  shop_title: string;
}

export enum TaskStatus {
  QUEUED = "queued",
  DOWNLOADING = "downloading",
  COMPLETED = "completed",
  ERROR = "error",
  PAUSED = "paused",
}

export interface TaskDownloadItemResponse {
  id: string;
  title: string;
  downloaded_gb: number;
  total_gb: number;
  status: TaskStatus;
  icon: string | null;
  source: "file" | "url";
  file_name: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskRecordResponse {
  task_id: string;
  title: string;
  passwords: string[];
  items: TaskDownloadItemResponse[];
  created_at: string;
  updated_at: string;
}

export interface TasksListResponse {
  tasks: TaskRecordResponse[];
  last_updated_at: string;
}

export interface CreateTaskFileInput {
  name: string;
  size_gb?: number;
}

export interface CreateTaskRequest {
  files?: CreateTaskFileInput[];
  urls?: string[];
  passwords?: string[];
}

export interface CreateTaskResponse {
  task: TaskRecordResponse;
}

export interface DeleteTaskResponse {
  ok: boolean;
}
