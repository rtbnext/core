import { TDBStats, TGlobalStats, THistory, TProfileStats, TScatter, TWealthStats } from '@rtbnext/schema/src/model/stats';

export interface IStats {
    getGlobalStats () : TGlobalStats;
    getDBStats () : TDBStats;
    getHistory () : THistory;
    getProfileStats () : TProfileStats;
    getWealthStats () : TWealthStats;
    getScatter () : TScatter;
}
