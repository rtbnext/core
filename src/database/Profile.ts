import { ProfileURI } from '@rtbnext/schema/src/abstract/primitives';
import { Profile as ProfileData } from '@rtbnext/schema/src/collection/profile';
import { Database } from './Api';

export class Profile {

    private database: Database;

    private readonly uri: ProfileURI;
    private readonly path: string;
    private data: ProfileData< ProfileURI >;
    private resources: string[];

    constructor ( uriLike: ProfileURI, redirect: boolean = false ) {

        this.database = Database.getInstance();

        const uri = Database.sanitize< ProfileURI >( uriLike );

    }

}
