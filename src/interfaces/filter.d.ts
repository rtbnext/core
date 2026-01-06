import { TFilterGroup, TFilterSpecial } from '@rtbnext/schema/src/abstract/const';
import { TFilterItem, TFilterList } from '@rtbnext/schema/src/model/filter';

export interface IFilter {
    resolvePath ( path: string ) : string | false;
    getFilter ( group: TFilterGroup, key: string ) : TFilterItem[] | false;
    getFilterByPath ( path: string ) : TFilterItem[] | false;
    getGroup ( group: TFilterGroup ) : Record< string, TFilterItem[] >;
    getSpecial ( special: TFilterSpecial ) : TFilterItem[];
    has ( path: string, uriLike: string ) : boolean;
    save ( collection: Partial< TFilterList > ) : void;
}
