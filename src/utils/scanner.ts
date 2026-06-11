import fs from "fs";
import path from "path";
import { CacheEntry, PackSubItem, PkgShopItem, ShopItem } from "@/types";
import {
  parsePkgHeader,
  readPkgFile,
  parseSfo,
  sanitizeFilename,
  formatFileSize,
  md5Hash,
  ICON0_ID,
  PARAM_SFO_ID,
} from "./pkg-parser";

const CACHE_FOLDER = path.join(process.cwd(), "cached");
const DB_FILE = path.join(process.cwd(), "db.json");
const FILES_FOLDER = path.join(process.cwd(), "files");
const ITEMS_PER_PAGE = 12;
export { ITEMS_PER_PAGE };

// ── Persistent in-process state (survives Next.js hot-reload via global) ───

declare global {
  var __scannerState:
    | {
        categorizedData: Record<string, ShopItem[]>;
        allItems: ShopItem[];
        pkgLookup: Record<string, string>;
      }
    | undefined;
}

if (!global.__scannerState) {
  global.__scannerState = { categorizedData: {}, allItems: [], pkgLookup: {} };
}

export function getCategorizedData(): Record<string, ShopItem[]> {
  return global.__scannerState!.categorizedData;
}

export function getAllItems(): ShopItem[] {
  return global.__scannerState!.allItems;
}

export function getPkgLookup(): Record<string, string> {
  return global.__scannerState!.pkgLookup;
}

// ── Cache helpers ───────────────────────────────────────────────────────────

function loadCache(): Record<string, CacheEntry> {
  if (!fs.existsSync(DB_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, CacheEntry>): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2), "utf-8");
  } catch {
    /* ignore */
  }
}

// ── File utilities ──────────────────────────────────────────────────────────

function findPkgFiles(dir: string, recursive = true): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const stat = fs.statSync(dir);
  if (!stat.isDirectory()) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (recursive && entry.isDirectory()) {
      results.push(...findPkgFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pkg")) {
      results.push(fullPath);
    }
  }
  return results;
}

function toUiFilePath(absolutePath: string): string {
  const relativePath = path.relative(process.cwd(), absolutePath);
  const normalized = relativePath.split(path.sep).join("/");
  return normalized.startsWith(".") ? normalized : `./${normalized}`;
}

// ── Category sort key (mirrors Python get_sort_key) ────────────────────────

function getSortKey(categoryType: string | null): number {
  if (categoryType === "gd" || categoryType === "gde") return 1;
  if (categoryType === "gp") return 2;
  if (categoryType === "ac") return 3;
  return 4;
}

// ── Scan a single category directory ───────────────────────────────────────

function scanCategory(
  folderPath: string,
  categoryName: string,
  cache: Record<string, CacheEntry>,
  recursive = true,
): { entries: CacheEntry[]; foundFiles: Set<string> } {
  const absPath = path.resolve(folderPath);
  if (!fs.existsSync(absPath) || !fs.statSync(absPath).isDirectory()) {
    return { entries: [], foundFiles: new Set() };
  }

  fs.mkdirSync(CACHE_FOLDER, { recursive: true });

  const pkgPaths = findPkgFiles(absPath, recursive);
  const entries: CacheEntry[] = [];

  for (const pkgPath of pkgPaths) {
    try {
      const mtime = fs.statSync(pkgPath).mtimeMs;
      const cached = cache[pkgPath];
      const absolutePkgPath = path.resolve(pkgPath);
      const fallbackHash = md5Hash(absolutePkgPath);

      let entry: CacheEntry;
      let pkgInfo: ReturnType<typeof parsePkgHeader> = null;

      if (cached && cached.mtime === mtime) {
        entry = { ...cached };
        // Keep backwards compatibility for old cache entries that may miss file_hash.
        if (!entry.content_id && !entry.file_hash) {
          entry.file_hash = fallbackHash;
        }
      } else {
        // Parse PKG
        let title: string | null = null;
        let categoryType: string | null = null;
        let titleId: string | null = null;
        pkgInfo = parsePkgHeader(pkgPath);
        const contentId: string | null = pkgInfo?.contentId ?? null;

        if (pkgInfo) {
          const sfoEntry = pkgInfo.files.get(PARAM_SFO_ID);
          if (sfoEntry) {
            const sfoData = readPkgFile(pkgPath, sfoEntry);
            if (sfoData) {
              const sfo = parseSfo(sfoData);
              title = sfo.title;
              categoryType = sfo.category;
              titleId = sfo.titleId;
            }
          }
        }

        entry = {
          filepath: pkgPath,
          filename: path.basename(pkgPath),
          title,
          content_id: contentId,
          category_type: categoryType,
          title_id: titleId,
          mtime,
          image_file: null,
          file_size_bytes: fs.statSync(pkgPath).size,
        };

        if (!contentId) {
          entry.file_hash = fallbackHash;
        }
      }

      const imageBaseName =
        sanitizeFilename(entry.content_id) ?? entry.file_hash ?? fallbackHash;
      const existingImagePath = entry.image_file
        ? path.join(CACHE_FOLDER, entry.image_file)
        : null;

      // Mirror Python behavior: refresh missing icon even for cache-hit entries.
      if (
        imageBaseName &&
        (!entry.image_file ||
          !existingImagePath ||
          !fs.existsSync(existingImagePath))
      ) {
        if (!pkgInfo) {
          pkgInfo = parsePkgHeader(pkgPath);
        }
        const iconEntry = pkgInfo?.files.get(ICON0_ID);
        if (iconEntry) {
          const iconData = readPkgFile(pkgPath, iconEntry);
          if (iconData) {
            const imgFilename = `${imageBaseName}.png`;
            fs.writeFileSync(path.join(CACHE_FOLDER, imgFilename), iconData);
            entry.image_file = imgFilename;
          }
        }
      }

      cache[pkgPath] = entry;
      entries.push(entry);
    } catch (err) {
      console.error(`Failed to process ${pkgPath}:`, err);
    }
  }

  return { entries, foundFiles: new Set(pkgPaths) };
}

// ── Build ShopItem from a single CacheEntry ────────────────────────────────

function buildShopItem(entry: CacheEntry, categoryName: string): PkgShopItem {
  const id = entry.content_id ?? entry.file_hash ?? "";
  return {
    is_pack: false,
    title: entry.title,
    content_id: entry.content_id,
    category_type: entry.category_type,
    title_id: entry.title_id,
    image_path: entry.image_file ? `/api/cached/${entry.image_file}` : null,
    file_size_bytes: entry.file_size_bytes,
    file_size_str: formatFileSize(entry.file_size_bytes),
    install_url: `/api/serve_pkg/${encodeURIComponent(id)}`,
    file_path: toUiFilePath(entry.filepath),
    category: categoryName,
  };
}

// ── Full scan ───────────────────────────────────────────────────────────────

export function performFullScan(): string[] {
  const cache = loadCache();
  const allFoundFiles = new Set<string>();
  const newCategorizedData: Record<string, ShopItem[]> = {};
  const newPkgLookup: Record<string, string> = {};
  const combinedItems: ShopItem[] = [];

  const targets: Array<{
    categoryName: string;
    folderPath: string;
    recursive: boolean;
  }> = [];
  if (fs.existsSync(FILES_FOLDER) && fs.statSync(FILES_FOLDER).isDirectory()) {
    const rootEntries = fs.readdirSync(FILES_FOLDER, { withFileTypes: true });
    const categoryDirs = rootEntries.filter((entry) => entry.isDirectory());

    for (const dir of categoryDirs) {
      targets.push({
        categoryName: dir.name,
        folderPath: path.join(FILES_FOLDER, dir.name),
        recursive: true,
      });
    }

    const hasRootPkg = findPkgFiles(FILES_FOLDER, false).length > 0;
    if (hasRootPkg || categoryDirs.length === 0) {
      targets.push({
        categoryName: "files",
        folderPath: FILES_FOLDER,
        recursive: categoryDirs.length === 0,
      });
    }
  }

  for (const target of targets) {
    const { categoryName, folderPath, recursive } = target;
    const { entries, foundFiles } = scanCategory(
      folderPath,
      categoryName,
      cache,
      recursive,
    );
    foundFiles.forEach((f) => allFoundFiles.add(f));

    if (entries.length === 0) continue;

    // Group by directory
    const groupedByDir = new Map<string, CacheEntry[]>();
    for (const entry of entries) {
      const dir = path.dirname(entry.filepath);
      if (!groupedByDir.has(dir)) groupedByDir.set(dir, []);
      groupedByDir.get(dir)!.push(entry);
    }

    // Merge DLC subdirs into parent
    const dirsToRemove = new Set<string>();
    for (const [dir, pkgs] of groupedByDir) {
      const dirName = path.basename(dir).toUpperCase();
      if (dirName === "DLC" || dirName === "DLCS") {
        const parentDir = path.dirname(dir);
        if (groupedByDir.has(parentDir)) {
          groupedByDir.get(parentDir)!.push(...pkgs);
          dirsToRemove.add(dir);
        }
      }
    }
    for (const d of dirsToRemove) groupedByDir.delete(d);

    // Build final list
    const rootPath = path.resolve(folderPath);
    const finalList: ShopItem[] = [];

    for (const [dir, pkgsInDir] of groupedByDir) {
      if (path.resolve(dir) === rootPath) {
        // Root-level PKGs → individual items
        for (const entry of pkgsInDir) {
          finalList.push(buildShopItem(entry, categoryName));
        }
      } else {
        // Sub-directory → pack
        pkgsInDir.sort(
          (a, b) => getSortKey(a.category_type) - getSortKey(b.category_type),
        );

        let totalSize = 0;
        let iconPath: string | null = null;
        const subItems: PackSubItem[] = [];

        for (const entry of pkgsInDir) {
          totalSize += entry.file_size_bytes;
          if (
            !iconPath &&
            (entry.category_type === "gd" || entry.category_type === "gde") &&
            entry.image_file
          ) {
            iconPath = `/api/cached/${entry.image_file}`;
          }
          const id = entry.content_id ?? entry.file_hash ?? "";
          subItems.push({
            title: entry.title,
            category_type: entry.category_type,
            install_url: `/api/serve_pkg/${encodeURIComponent(id)}`,
            file_path: toUiFilePath(entry.filepath),
          });
        }

        if (!iconPath && pkgsInDir[0]?.image_file) {
          iconPath = `/api/cached/${pkgsInDir[0].image_file}`;
        }

        finalList.push({
          is_pack: true,
          title: path.basename(dir),
          image_path: iconPath,
          file_size_bytes: totalSize,
          file_size_str: formatFileSize(totalSize),
          category: categoryName,
          category_type: "pack",
          items: subItems,
          install_url: null,
        });
      }
    }

    if (finalList.length > 0) {
      finalList.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
      combinedItems.push(...finalList);
    }
  }

  if (combinedItems.length > 0) {
    combinedItems.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    newCategorizedData.all = combinedItems;
  }

  // Clean orphaned cache entries
  for (const key of Object.keys(cache)) {
    if (!allFoundFiles.has(key)) delete cache[key];
  }
  saveCache(cache);

  // Rebuild lookup
  for (const [, entry] of Object.entries(cache)) {
    if (entry.content_id) newPkgLookup[entry.content_id] = entry.filepath;
    if (entry.file_hash) newPkgLookup[entry.file_hash] = entry.filepath;
  }

  global.__scannerState!.categorizedData = newCategorizedData;
  global.__scannerState!.allItems = combinedItems;
  global.__scannerState!.pkgLookup = newPkgLookup;

  return Object.keys(newCategorizedData).sort();
}
