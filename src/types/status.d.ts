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

export type TStatusServicePolicy = {
  samples: number;
  degradedThreshold: number;
  outageThreshold: number;
};

export type TStatusPolicy = Record< TService, TStatusServicePolicy >;
