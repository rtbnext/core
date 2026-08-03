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
  'female': 'f',
  'woman': 'f',
  'feminine': 'f',

  'male': 'm',
  'man': 'm',
  'masculine': 'm',

  'non-binary': 'd',
  'nonbinary-person': 'd',
  'nonbinary': 'd',
  'diverse': 'd',

  'f': 'f',
  'm': 'm',
  'd': 'd'
} as const;

export const MaritalStatusResolver: TMaritalStatusResolver = {
  'long-term-relationship': 'relationship',
  'in-a-relationship': 'relationship',
  'in-relationship': 'relationship',
  'partnered': 'relationship',
  'relationship': 'relationship',

  'never-married': 'single',
  'single': 'single',

  'remarried': 'remarried',
  'married': 'married',
  'engaged': 'engaged',
  'separated': 'separated',
  'divorced': 'divorced',
  'widowed': 'widowed'
} as const;

export const IndustryResolver: TIndustryResolver = {
  'fashion-and-retail': 'retail',
  'fashion-retail': 'retail',
  'fashion': 'retail',
  'retail': 'retail',

  'finance-and-investments': 'finance',
  'finance-investments': 'finance',
  'financial-services': 'finance',
  'financial-service': 'finance',
  'investments': 'finance',
  'banking': 'finance',
  'finance': 'finance',

  'construction-and-engineering': 'engineering',
  'construction-engineering': 'engineering',
  'construction': 'engineering',
  'engineering': 'engineering',

  'sports-entertainment': 'sports',
  'entertainment-sports': 'sports',
  'sports': 'sports',

  'media-and-entertainment': 'media',
  'media-entertainment': 'media',
  'entertainment': 'media',
  'media': 'media',

  'real-estate-development': 'property',
  'real-estate': 'property',
  'realestate': 'property',
  'realty': 'property',
  'property': 'property',

  'gambling-and-casinos': 'gambling',
  'gambling-casinos': 'gambling',
  'casinos': 'gambling',
  'gaming': 'gambling',
  'gambling': 'gambling',

  'metals-and-mining': 'mining',
  'metals-mining': 'mining',
  'metals': 'mining',
  'mining': 'mining',

  'telecommunications': 'telecom',
  'telecommunication': 'telecom',
  'telecom-services': 'telecom',
  'communications': 'telecom',
  'telecom': 'telecom',

  'automotive-industry': 'automotive',
  'automotive': 'automotive',
  'autos': 'automotive',
  'auto': 'automotive',

  'health-care': 'healthcare',
  'healthcare': 'healthcare',
  'pharmaceuticals': 'healthcare',
  'pharma': 'healthcare',
  'medical': 'healthcare',

  'oil-and-gas': 'energy',
  'oil-gas': 'energy',
  'utilities': 'energy',
  'energy': 'energy',

  'industrials': 'manufacturing',
  'industrial': 'manufacturing',
  'manufacturing': 'manufacturing',

  'transportation': 'logistics',
  'transport': 'logistics',
  'logistics': 'logistics',

  'services': 'service',
  'service': 'service',

  'technology': 'technology',
  'tech': 'technology',

  'diversified': 'diversified'
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
