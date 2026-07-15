import type { TProfileStatusFlag } from '@rtbnext/schema/src/base/const';
import type { TProfileStatus } from '@rtbnext/schema/src/model/profile';
import type { Expand } from 'devtypes/types/util';


export type TValidateState = {
  flags: string[];
  invalid: boolean;
  penalty: number;
};

export type TIntegrityCheck = readonly ( readonly [
  check: unknown,
  flag: string,
  penalty: number,
  invalid: boolean
] )[];

export type TIntegrityReportItem = Expand< TProfileStatus & {
  uri: string;
} >;

export type TIntegrityReportFlags = { [ F in TProfileStatusFlag ]?: number };

export type TIntegrityReport = {
  generatedAt: string;
  stats: {
    total: number;
    affected: number;
    flags: TIntegrityReportFlags;
    avgScore: number;
  };
  items: TIntegrityReportItem[];
};
