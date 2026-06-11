export interface FileEntry {
  id: number;
  offset: number;
  size: number;
}

export interface PkgInfo {
  contentId: string | null;
  files: Map<number, FileEntry>;
}

export interface SfoInfo {
  title: string | null;
  category: string | null;
  titleId: string | null;
}
