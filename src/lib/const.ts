import type {
  TAssetType, TChangeFlag, TChildrenGroup, TFilterGroup, TFilterSpecial, TGender, TIndustry,
  TMaritalStatus, TPercentiles, TRelationType, TSelfMadeRank, TStatsGroup, TWealthSpread
} from '@rtbnext/schema/src/base/const';

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

// --- stats ---

export const StatsGroup: TStatsGroup[] = [
  'industry', 'citizenship'
] as const;

export const ChildrenGroup: TChildrenGroup[] = [
  'none', 'one', 'two', 'three', 'four', '5-to-10', 'over-10'
] as const;

export const Percentiles: TPercentiles[] = [
  '10th', '25th', '50th', '75th', '90th', '95th', '99th'
] as const;

export const WealthSpread: TWealthSpread[] = [
  '1', '2', '5', '10', '20', '50', '100', '200', '500'
] as const;

// --- filter ---

export const FilterGroup: TFilterGroup[] = [
  'industry', 'citizenship', 'country', 'state', 'gender', 'age', 'maritalStatus', 'special'
] as const;

export const FilterSpecial: TFilterSpecial[] = [
  'deceased', 'dropOff', 'family', 'selfMade'
] as const;
