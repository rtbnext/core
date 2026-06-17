import type { TGender, TIndustry, TMaritalStatus } from '@rtbnext/schema/src/base/const';

export const Gender: TGender[] = [
  'm', 'f', 'd'
] as const;

export const MaritalStatus: TMaritalStatus[] = [
    'single', 'relationship', 'married', 'remarried', 'engaged',
    'separated', 'divorced', 'widowed'
] as const;

export const Industry: TIndustry[] = [
    'automotive', 'diversified', 'energy', 'engineering', 'finance', 'foodstuff',
    'gambling', 'healthcare', 'logistics', 'manufacturing', 'media', 'mining',
    'property', 'retail', 'service', 'sports', 'technology', 'telecom'
] as const;
