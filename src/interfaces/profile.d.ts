import { TMetaData } from '@rtbnext/schema/src/abstract/generic';
import * as P from '@rtbnext/schema/src/model/profile';

export interface IProfile {
    getUri () : string;
    getItem () : P.TProfileIndexItem;
    getMeta () : TMetaData[ '@metadata' ];
    schemaVersion () : number;
    modified () : string;
    modifiedTime () : number;
    verify ( id: string ) : boolean;
    getData () : P.TProfileData;
    setData (
        data: P.TProfileData, aliases?: string[],
        aliasMode: 'replace' | 'unique' = 'unique'
    ) : void;
    updateData (
        data: Partial< P.TProfileData >, aliases?: string[],
        mode: 'concat' | 'replace' | 'unique' = 'replace',
        aliasMode: 'replace' | 'unique' = 'unique'
    ) : void;
    getHistory () : P.TProfileHistory;
    setHistory ( history: P.TProfileHistory ) : void;
    addHistory ( row: P.TProfileHistoryItem ) : void;
    mergeHistory ( history: P.TProfileHistory ) : void;
    save () : void;
    move ( uriLike: string, makeAlias: boolean = true ) : boolean;
}
