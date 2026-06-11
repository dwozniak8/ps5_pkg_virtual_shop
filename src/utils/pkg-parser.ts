import fs from "fs";
import crypto from "crypto";
import { FileEntry, PkgInfo, SfoInfo } from "@/types";

// PS4 PKG magic: \x7fCNT
const MAGIC_PS4 = 0x7f434e54;
export const ICON0_ID = 0x1200;
export const PARAM_SFO_ID = 0x1000;

function safeDecodeBuffer(buf: Buffer): string {
  return buf.toString("utf8").replace(/\x00/g, "").trim();
}

/**
 * Parses the header of a PS4 PKG file and returns the content ID and file table.
 *
 * Header format (big-endian): 5×uint32, 2×uint16, 2×uint32, 4×uint64, 36 bytes, 12 bytes, 12×uint32
 * Byte offsets:
 *   [0]  = magic        (uint32, offset 0)
 *   [4]  = pkg_entry_count (uint32, offset 16)
 *   [7]  = table_offset    (uint32, offset 24)
 *   [13] = 36-byte field   (offset 64)
 *   [14] = 12-byte field   (content_id, offset 100)
 */
export function parsePkgHeader(filePath: string): PkgInfo | null {
  let fd: number | null = null;
  try {
    fd = fs.openSync(filePath, "r");

    const HEADER_SIZE = 5 * 4 + 2 * 2 + 2 * 4 + 4 * 8 + 36 + 12 + 12 * 4; // 160 bytes
    const headerBuf = Buffer.alloc(HEADER_SIZE);
    const bytesRead = fs.readSync(fd, headerBuf, 0, HEADER_SIZE, 0);
    if (bytesRead < HEADER_SIZE) return null;

    const magic = headerBuf.readUInt32BE(0);
    if (magic !== MAGIC_PS4) return null;

    const entryCount = headerBuf.readUInt32BE(16); // index [4]
    const tableOffset = headerBuf.readUInt32BE(24); // index [7]
    const contentIdBuf = headerBuf.subarray(100, 112); // index [14]: 12 bytes at offset 100
    const contentId = safeDecodeBuffer(contentIdBuf) || null;

    if (entryCount === 0 || entryCount > 50000) return null;

    // Entry format (big-endian): 6×uint32 + 1×uint64 = 32 bytes
    const ENTRY_SIZE = 6 * 4 + 8;
    const tableBuf = Buffer.alloc(ENTRY_SIZE * entryCount);
    fs.readSync(fd, tableBuf, 0, ENTRY_SIZE * entryCount, tableOffset);

    const files = new Map<number, FileEntry>();
    for (let i = 0; i < entryCount; i++) {
      const base = i * ENTRY_SIZE;
      const fileId = tableBuf.readUInt32BE(base);
      const offset = tableBuf.readUInt32BE(base + 16); // index [4]
      const size = tableBuf.readUInt32BE(base + 20); // index [5]
      files.set(fileId, { id: fileId, offset, size });
    }

    return { contentId, files };
  } catch {
    return null;
  } finally {
    if (fd !== null)
      try {
        fs.closeSync(fd);
      } catch {
        /* ignore */
      }
  }
}

export function readPkgFile(filePath: string, entry: FileEntry): Buffer | null {
  let fd: number | null = null;
  try {
    fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(entry.size);
    fs.readSync(fd, buf, 0, entry.size, entry.offset);
    return buf;
  } catch {
    return null;
  } finally {
    if (fd !== null)
      try {
        fs.closeSync(fd);
      } catch {
        /* ignore */
      }
  }
}

export function parseSfo(data: Buffer): SfoInfo {
  const result: SfoInfo = { title: null, category: null, titleId: null };
  try {
    if (data.length < 20) return result;
    const magic = data.readUInt32LE(0);
    if (magic !== 0x46535000) return result;

    const keyTableOffset = data.readUInt32LE(8);
    const dataTableOffset = data.readUInt32LE(12);
    const numEntries = data.readUInt32LE(16);

    const INDEX_TABLE_OFFSET = 20;
    for (let i = 0; i < numEntries; i++) {
      const base = INDEX_TABLE_OFFSET + i * 16;
      if (base + 16 > data.length) break;

      const keyOff = data.readUInt16LE(base);
      const dataLen = data.readUInt32LE(base + 4);
      const dataOff = data.readUInt32LE(base + 12);

      const keyStart = keyTableOffset + keyOff;
      const keyEnd = data.indexOf(0, keyStart);
      if (keyEnd < 0) continue;
      const key = data.subarray(keyStart, keyEnd).toString("utf8");

      const dataStart = dataTableOffset + dataOff;
      const value = data
        .subarray(dataStart, dataStart + dataLen)
        .toString("utf8")
        .replace(/\x00/g, "");

      if (key === "TITLE") result.title = value;
      else if (key === "CATEGORY") result.category = value;
      else if (key === "TITLE_ID") result.titleId = value;
    }
  } catch {
    /* ignore */
  }
  return result;
}

export function sanitizeFilename(name: string | null): string | null {
  if (!name) return null;
  let s = name.replace(/\x00/g, "").trim();
  s = s.replace(/[\\/*?:"<>|]/g, "_");
  return s || null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0B";
  const gb = bytes / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

export function md5Hash(text: string): string {
  return crypto.createHash("md5").update(text).digest("hex");
}
