import type { TAssetType, TChangeFlag, TGender, TIndustry, TMaritalStatus, TRelationType, TSelfMadeRank } from '@rtbnext/schema/src/base/const';

// --- basics ---

export const Industry: TIndustry[] = [
  'automotive', 'diversified', 'energy', 'engineering', 'finance', 'foodstuff', 'gambling',
  'healthcare', 'logistics', 'manufacturing', 'media', 'mining', 'property', 'retail', 'service',
  'sports', 'technology', 'telecom'
] as const;

export const Gender: TGender[] = [
  'm', 'f', 'd'
] as const;

export const MaritalStatus: TMaritalStatus[] = [
  'single', 'relationship', 'married', 'remarried', 'engaged', 'separated', 'divorced', 'widowed'
] as const;

export const SelfMadeRank: TSelfMadeRank[] = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
] as const;

export const RelationType: TRelationType[] = [
  'person', 'organization', 'place', 'unknown'
] as const;

export const AssetType: TAssetType[] = [
  'public', 'private', 'misc'
] as const;

export const ChangeFlag: TChangeFlag[] = [
  'up', 'down', 'unchanged'
] as const;
