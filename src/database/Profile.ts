import { ProfileURI } from '@rtbnext/schema/src/abstract/primitives';
import { Profile as ProfileData } from '@rtbnext/schema/src/collection/profile';
import { Database } from './Api';

export class Profile {

    private DB: Database;

    private uri: ProfileURI;
    private path: string;
    private redirected: boolean;
    private data: Partial< ProfileData< ProfileURI > >;
    private resources: string[];
    private loaded: string[];

    constructor ( uriLike: string ) {

        this.DB = Database.getInstance();

        const uri = Database.sanitize< ProfileURI >( uriLike );
        if ( uri in this.DB.profileIndex ) this.loadProfile( uri, false );
        else if ( uri in this.DB.profileAlias ) this.loadProfile( this.DB.profileAlias[ uri ], true );
        throw new Error( `Profile [${uri}] does not exist` );

    }

    private loadProfile ( uri: ProfileURI, redirected = false ) : void {

        this.uri = uri;
        this.path = `profile/${uri}/`;
        this.redirected = redirected;
        this.data = {};
        this.resources = this.DB.getStorage().scanDir( this.path );
        this.loaded = [];

    }

    public getUri () : ProfileURI { return this.uri }
    public isRedirected () : boolean { return this.redirected }

}

export function getProfile ( uriLike: string ) : Profile | false {

    try { return new Profile( uriLike ) }
    catch { return false }

}
