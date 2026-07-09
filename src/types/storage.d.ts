export type TStorageRWType = 'raw' | 'json' | 'csv';

export type TStorageScanType = 'files' | 'dirs' | 'all';

export type TStorageWOptions = {
  append: boolean;
  nl: boolean;
};
