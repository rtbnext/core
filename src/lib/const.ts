import type {
  TAssetType, TChangeFlag, TChildrenGroup, TFilterGroup, TFilterSpecial, TGender, TIndustry,
  TMaritalStatus, TPercentile, TRelationType, TSelfMadeRank, TService, TStatsGroup, TWealthSpread
} from '@rtbnext/schema/src/base/const';

import type { TGenderResolver, TIndustryResolver, TMaritalStatusResolver } from '@/type/generic';
import type { TStatusPolicy } from '@/type/status';


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

export const GenderResolver: TGenderResolver = {
  'm': 'm',
  'f': 'f',
  'd': 'd',

  'male': 'm',
  'man': 'm',
  'masculine': 'm',

  'female': 'f',
  'woman': 'f',
  'feminine': 'f',

  'diverse': 'd',
  'non-binary': 'd',
  'nonbinary': 'd',
  'nonbinary-person': 'd'
} as const;

export const MaritalStatusResolver: TMaritalStatusResolver = {
  'single': 'single',
  'never-married': 'single',

  'in-relationship': 'relationship',
  'in-a-relationship': 'relationship',
  'relationship': 'relationship',
  'partnered': 'relationship',
  'long-term-relationship': 'relationship',

  'married': 'married',
  'remarried': 'remarried',
  'engaged': 'engaged',
  'separated': 'separated',
  'divorced': 'divorced',
  'widowed': 'widowed'
} as const;

export const IndustryResolver: TIndustryResolver = {
  'technology': 'technology',
  'tech': 'technology',

  'fashion-retail': 'retail',
  'fashion-and-retail': 'retail',
  'fashion': 'retail',
  'retail': 'retail',

  'finance-investments': 'finance',
  'finance-and-investments': 'finance',
  'finance': 'finance',
  'investments': 'finance',
  'financial-services': 'finance',
  'financial-service': 'finance',
  'banking': 'finance',

  'diversified': 'diversified',

  'telecom': 'telecom',
  'telecommunication': 'telecom',
  'communications': 'telecom',
  'telecommunications': 'telecom',
  'telecom-services': 'telecom',

  'energy': 'energy',
  'oil-gas': 'energy',
  'oil-and-gas': 'energy',
  'utilities': 'energy',

  'metals-mining': 'mining',
  'metals-and-mining': 'mining',
  'metals': 'mining',
  'mining': 'mining',

  'gambling-casinos': 'gambling',
  'gambling-and-casinos': 'gambling',
  'gambling': 'gambling',
  'casinos': 'gambling',
  'gaming': 'gambling',

  'healthcare': 'healthcare',
  'health-care': 'healthcare',
  'pharmaceuticals': 'healthcare',
  'pharma': 'healthcare',
  'medical': 'healthcare',

  'manufacturing': 'manufacturing',
  'industrial': 'manufacturing',
  'industrials': 'manufacturing',

  'logistics': 'logistics',
  'transportation': 'logistics',
  'transport': 'logistics',

  'automotive': 'automotive',
  'auto': 'automotive',
  'autos': 'automotive',
  'automotive-industry': 'automotive',

  'media-entertainment': 'media',
  'media-and-entertainment': 'media',
  'media': 'media',
  'entertainment': 'media',

  'construction-engineering': 'engineering',
  'construction-and-engineering': 'engineering',
  'construction': 'engineering',
  'engineering': 'engineering',

  'sports': 'sports',
  'sports-entertainment': 'sports',
  'entertainment-sports': 'sports',

  'real-estate': 'property',
  'real-estate-development': 'property',
  'property': 'property',
  'realestate': 'property',
  'realty': 'property',

  'service': 'service',
  'services': 'service'
} as const;

// --- status ---

export const Services: TService[] = [
  'profile', 'list', 'mover', 'filter', 'stats', 'system'
] as const;

export const StatusPolicy: TStatusPolicy = {
  profile: {
    samples: 80,
    degradedThreshold: 0.25,
    outageThreshold: 0.5
  },
  list: {
    samples: 10,
    degradedThreshold: 0.2,
    outageThreshold: 0.4
  },
  mover: {
    samples: 10,
    degradedThreshold: 0.2,
    outageThreshold: 0.4
  },
  filter: {
    samples: 10,
    degradedThreshold: 0.1,
    outageThreshold: 0.2
  },
  stats: {
    samples: 10,
    degradedThreshold: 0.1,
    outageThreshold: 0.2
  },
  system: {
    samples: 200,
    degradedThreshold: 0.2,
    outageThreshold: 0.4
  }
} as const;
