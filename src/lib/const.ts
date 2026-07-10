import type {
  TAssetType, TChangeFlag, TChildrenGroup, TFilterGroup, TFilterSpecial, TGender, TIndustry,
  TMaritalStatus, TPercentile, TRelationType, TSelfMadeRank, TService, TStatsGroup, TWealthSpread
} from '@rtbnext/schema/src/base/const';

import type { TIndustryResolver, TMaritalStatusResolver } from '@/type/generic';
import type { TStatusConfig } from '@/type/status';


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
  'up', 'down', 'unchanged', 'new', 'returned', 'dropoff', 'unknown'
] as const;

// --- stats ---

export const StatsGroup: TStatsGroup[] = [
  'industry', 'citizenship'
] as const;

export const ChildrenGroup: TChildrenGroup[] = [
  'none', 'one', 'two', 'three', 'four', '5-to-10', 'over-10'
] as const;

export const Percentile: TPercentile[] = [
  '10th', '25th', '50th', '75th', '90th', '95th', '99th'
] as const;

export const WealthSpread: TWealthSpread[] = [
  '1', '2', '5', '10', '20', '50', '100', '200', '500', '1000'
] as const;

// --- filter ---

export const FilterGroup: TFilterGroup[] = [
  'industry', 'citizenship', 'country', 'state', 'gender', 'age', 'maritalStatus', 'special'
] as const;

export const FilterSpecial: TFilterSpecial[] = [
  'deceased', 'dropOff', 'family', 'selfMade'
] as const;

// --- resolver ---

export const MaritalStatusResolver: TMaritalStatusResolver = {
  'single': 'single',
  'in-relationship': 'relationship',
  'married': 'married',
  'remarried': 'remarried',
  'engaged': 'engaged',
  'separated': 'separated',
  'divorced': 'divorced',
  'widowed': 'widowed'
} as const;

export const IndustryResolver: TIndustryResolver = {
  'technology': 'technology',
  'fashion-retail': 'retail',
  'finance-investments': 'finance',
  'diversified': 'diversified',
  'telecom': 'telecom',
  'energy': 'energy',
  'metals-mining': 'mining',
  'gambling-casinos': 'gambling',
  'healthcare': 'healthcare',
  'manufacturing': 'manufacturing',
  'logistics': 'logistics',
  'automotive': 'automotive',
  'media-entertainment': 'media',
  'construction-engineering': 'engineering',
  'sports': 'sports',
  'real-estate': 'property',
  'service': 'service'
} as const;

// --- status ---

export const Services: TService[] = [
  'profiles', 'lists', 'movers', 'filters', 'statistics'
] as const;

export const StatusConfig: TStatusConfig = {
  profiles: {
    samples: 40,
    degradedThreshold: 0.25,
    outageThreshold: 0.5
  },
  lists: {
    samples: 10,
    degradedThreshold: 0.2,
    outageThreshold: 0.4
  },
  movers: {
    samples: 10,
    degradedThreshold: 0.2,
    outageThreshold: 0.4
  },
  filters: {
    samples: 10,
    degradedThreshold: 0.1,
    outageThreshold: 0.2
  },
  statistics: {
    samples: 10,
    degradedThreshold: 0.1,
    outageThreshold: 0.2
  }
} as const;
