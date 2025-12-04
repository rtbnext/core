import { ProfileURI } from '@rtbnext/schema/src/abstract/primitives';
import { Profile as ProfileData } from '@rtbnext/schema/src/collection/profile';
import { Database } from './Api';

export class Profile {

    private database: Database;

    private uri: ProfileURI;
    private path: string;
    private redirected: boolean;
    private data: Partial< ProfileData< ProfileURI > > = {};
    private resources: string[] = [];
    private loaded: string[] = [];

    constructor ( uriLike: string ) {

        this.database = Database.getInstance();

        const uri = Database.sanitize< ProfileURI >( uriLike );
        if ( uri in this.database.profileIndex ) this.loadProfile( uri, false );
        else if ( uri in this.database.profileAlias ) this.loadProfile( this.database.profileAlias[ uri ], true );
        throw new Error( `Profile [${uri}] does not exist` );

    }

    private loadProfile ( uri: ProfileURI, redirected = false ) : void {

        this.uri = uri;
        this.path = `profile/${uri}/`;
        this.redirected = redirected;

    }

}

export function getProfile ( uriLike: string ) : Profile | false {

    try { return new Profile( uriLike ) }
    catch { return false }

}
