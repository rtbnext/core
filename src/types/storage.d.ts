export type TStorageRWType = 'raw' | 'json' | 'jsonl' | 'csv';

export type TStorageScanType = 'files' | 'dirs' | 'all';

export type TStorageWOptions = {
  append: boolean;
  nl: boolean;
};
