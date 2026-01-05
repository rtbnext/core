import { TIndex } from '@rtbnext/schema/src/abstract/generic';

export interface IIndex< I extends TIndex, T extends Map< string, I > > {
    getIndex () : T;
    size () : number;
    has ( uriLike: string ) : boolean;
    get ( uriLike: string ) : I | undefined;
    update ( uriLike: string, data: Partial< I >, allowUpdate: boolean = true ) : I | false;
    delta ( items: { uriLike: string, data: Partial< I > }[], allowUpdate: boolean = true ) : number;
    add ( uriLike: string, data: I ) : I | false;
    delete ( uriLike: string ) : void;
    search ( query: string, looseMatch: boolean = false ) : T;
}
