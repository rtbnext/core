import { ArrayMode } from '@komed3/deepmerge';
import type { TProfileIndex, TProfileIndexItem } from '@rtbnext/schema/src/model/profile';

import { Index } from '@/abstract/Index';
import { log } from '@/core/Logger';
import { Utils } from '@/core/Utils';
import type { IProfileIndex } from '@/interface/index';


export class ProfileIndex extends Index< TProfileIndexItem, TProfileIndex > implements IProfileIndex {
  protected static instance: IProfileIndex;
  private constructor () { super( 'profile', 'profile/index.json' ) }

  // --- alias helper ---

  private sanitizeAliases ( aliases: string[] ) : string[] {
    return aliases.map( a => Utils.sanitize( a ) ).filter( Boolean );
  }

  private getUriByAlias ( alias: string ) : string | false {
    return [ ...this.index.values() ].find( ( { aliases } ) => aliases.includes( alias ) )?.uri || false;
  }

  private assertAvailableAlias ( alias: string, whitelist: string[] = [] ) : void {
    if ( this.has( alias ) ) throw new Error( `Alias ${ alias } conflicts with existing profile URI` );

    const owner = this.getUriByAlias( alias );
    if ( owner && ! whitelist.includes( owner ) ) throw new Error( `Alias ${ alias } already exists for profile ${ owner }` );
  }

  private resolveAliases ( uri: string, aliases: string[], add: string[] = [], rmv: string[] = [] ) : string[] {
    for ( const a of add ) this.assertAvailableAlias( a, [ uri ] );
    return Utils.mergeArray( aliases.filter( alias => ! rmv.includes( alias ) ), add, ArrayMode.Unique );
  }

  // --- special profile index operations ---

  public find ( uriLike: string ) : TProfileIndex {
    const uri = Utils.sanitize( uriLike );
    return new Map( [ ...this.index ].filter( ( [ key, { aliases } ] ) => key === uri || aliases.includes( uri ) ) );
  }

  public move ( from: string, to: string, makeAlias: boolean = true ) : TProfileIndexItem | false {
    log.debug( `Moving profile index item from ${ from } to ${ to }` );

    return log.catch( () => {
      from = Utils.sanitize( from ), to = Utils.sanitize( to );
      const data = this.index.get( from ), test = this.find( to );
      if ( ! data || test.size > 1 ) throw new Error( 'Invalid move operation' );

      const foundKey = test.keys().next().value;
      if ( foundKey && foundKey !== from ) throw new Error( 'Destination already exists' );

      const item = { ...data, uri: to, aliases: this.resolveAliases(
        to, data.aliases, makeAlias ? [ from ] : [], [ to ]
      ) };

      this.index.delete( from );
      this.index.set( to, item );
      this.saveIndex();

      return item;
    }, `Failed to move profile index item ${ from } to ${ to }` ) ?? false;
  }

  // --- instantitate ---

  public static getInstance () : IProfileIndex {
    return ProfileIndex.instance ??= new ProfileIndex();
  }
}
