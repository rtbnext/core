import { Index } from '@/abstract/Index';
import { TProfileIndex, TProfileIndexItem } from '@/types/profile';
import { Utils } from '@/utils/Utils';

export class ProfileIndex extends Index< TProfileIndexItem, TProfileIndex > {

    protected static instance: ProfileIndex;

    private constructor () {
        super( 'profile/index.json' );
    }

    public find ( uriLike: string ) : TProfileIndex {
        const uri = Utils.sanitize( uriLike );
        return new Map( [ ...this.index ].filter( ( [ key, { aliases } ] ) =>
            key === uri || aliases.includes( uri )
        ) );
    }

    public move ( from: string, to: string, makeAlias: boolean = true ) : TProfileIndexItem | false {
        const sanitizedFrom = Utils.sanitize( from );
        const sanitizedTo = Utils.sanitize( to );

        const data = this.index.get( sanitizedFrom );
        if ( ! data || this.find( sanitizedTo ).size ) return false;

        const item = { ...data, uri: sanitizedTo };
        if ( makeAlias ) item.aliases.push( sanitizedFrom );
        this.index.delete( sanitizedFrom );
        this.index.set( sanitizedTo, item );
        this.saveIndex();

        return item;
    }

    public static getInstance () {
        return ProfileIndex.instance ||= new ProfileIndex();
    }

}
