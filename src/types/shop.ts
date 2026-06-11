export interface CacheEntry {
  filepath: string;
  filename: string;
  title: string | null;
  content_id: string | null;
  category_type: string | null;
  title_id: string | null;
  mtime: number;
  image_file: string | null;
  file_hash?: string;
  file_size_bytes: number;
}

export interface PackSubItem {
  title: string | null;
  category_type: string | null;
  install_url: string;
  file_path: string;
}

export interface PkgShopItem {
  is_pack: false;
  title: string | null;
  content_id: string | null;
  category_type: string | null;
  title_id: string | null;
  image_path: string | null;
  file_size_bytes: number;
  file_size_str: string;
  install_url: string;
  file_path: string;
  category: string;
}

export interface PackShopItem {
  is_pack: true;
  title: string;
  image_path: string | null;
  file_size_bytes: number;
  file_size_str: string;
  category: string;
  category_type: "pack";
  items: PackSubItem[];
  install_url: null;
}

export type ShopItem = PkgShopItem | PackShopItem;
