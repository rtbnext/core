import type { TStatsGroup as TStatsGroupType } from '@rtbnext/schema/src/base/const';
import type {
  TDBStats, TDBStatsData, TGlobalStats, TGlobalStatsData, THistory, TProfileStats, TProfileStatsData,
  TScatter, TScatterItem, TStatsGroup, TStatsGroupItem, TWealthStats, TWealthStatsData
} from '@rtbnext/schema/src/model/stats';

export interface IStats {
  getGlobalStats () : TGlobalStats;
  getProfileStats () : TProfileStats;
  getWealthStats () : TWealthStats;
  getScatter () : TScatter;
  getDBStats () : TDBStats;
  getHistory () : THistory;
  getGroupedStatsIndex ( group: TStatsGroupType ) : TStatsGroup< string >[ 'index' ];
  getGroupedStatsHistory ( group: TStatsGroupType, key: string ) : THistory;
  getGroupedStats ( group: TStatsGroupType ) : TStatsGroup< string >;
  setGlobalStats ( data: TGlobalStatsData ) : boolean;
  setProfileStats ( data: TProfileStatsData ) : boolean;
  setWealthStats ( data: TWealthStatsData ) : boolean;
  setScatter ( data: TScatterItem[] ) : boolean;
  setDBStats ( data: TDBStatsData ) : boolean;
  setGroupedStats< T extends string = string > ( group: TStatsGroupType, raw: Record< T, TStatsGroupItem > ) : boolean;
  updateHistory ( data: Partial< TGlobalStats > ) : boolean;
  generateWealthStats ( scatter: TScatterItem[] ) : boolean;
  generateDBStats () : boolean;
}
