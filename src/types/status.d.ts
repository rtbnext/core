import type { TService } from '@rtbnext/schema/src/base/const';


export type TStatusLogItem = {
  timestamp: string;
  services: TService[];
  job: string;
  success: boolean;
  duration: number;
  errMsg?: string;
};

export type TStatusLog = TStatusLogItem[];

export type TStatusPolicy = {
  samples: number;
  degradedRatio: number;
  outageRatio: number;
};

export type TStatusConfig = Record< TService, TStatusPolicy >;
