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
