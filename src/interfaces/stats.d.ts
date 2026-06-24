import type { TStatsGroup as TStatsGroupType } from '@rtbnext/schema/src/base/const';
import type { TListSnapshot } from '@rtbnext/schema/src/model/list';
import type {
  TDBStats, TDBStatsData, TGlobalStats, TGlobalStatsData, THistory, TProfileStats,
  TProfileStatsData, TScatter, TScatterItem, TStatsGroup, TStatsGroupItem, TTop10,
  TTop10Data, TTop10List, TWealthStats, TWealthStatsData
} from '@rtbnext/schema/src/model/stats';

export interface IStats {
  getGlobalStats () : TGlobalStats;
  getProfileStats () : TProfileStats;
  getWealthStats () : TWealthStats;
  getScatter () : TScatter;
  getTop10 () : TTop10;
  getDBStats () : TDBStats;
  getHistory () : THistory;
  getGroupedStatsIndex ( group: TStatsGroupType ) : TStatsGroup< string >[ 'index' ];
  getGroupedStatsHistory ( group: TStatsGroupType, key: string ) : THistory;
  getGroupedStats ( group: TStatsGroupType ) : TStatsGroup< string >;
  setGlobalStats ( data: TGlobalStatsData ) : boolean;
  setProfileStats ( data: TProfileStatsData ) : boolean;
  setWealthStats ( data: TWealthStatsData ) : boolean;
  setScatter ( data: TScatterItem[] ) : boolean;
  setTop10 ( data: TTop10Data ) : boolean;
  updateTop10 ( year: string | number, month: string | number, list: TTop10List ) : boolean;
  setDBStats ( data: TDBStatsData ) : boolean;
  setGroupedStats< T extends string = string > ( group: TStatsGroupType, raw: Record< T, TStatsGroupItem > ) : boolean;
  updateHistory ( data: Partial< TGlobalStats > ) : boolean;
  generateWealthStats ( scatter: TScatterItem[] ) : boolean;
  generateTop10Entry ( snapshot: TListSnapshot ) : boolean;
  generateDBStats () : boolean;
}
