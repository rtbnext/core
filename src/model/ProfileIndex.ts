import { ArrayMode } from '@komed3/deepmerge';
import type { TProfileData, TProfileIndex, TProfileIndexItem } from '@rtbnext/schema/src/model/profile';

import { Index } from '@/abstract/Index';
import { log } from '@/core/Logger';
import { Utils } from '@/core/Utils';
import type { IProfileIndex } from '@/interface/index';
import { Profile } from '@/model/Profile';


export class ProfileIndex extends Index< TProfileIndexItem, TProfileIndex > implements IProfileIndex {
  protected static instance: IProfileIndex;
  private constructor () { super( 'profile', 'profile/index.json' ) }

  // --- alias helper ---

  private sanitizeAliases ( aliases: string[] ) : string[] {
    return aliases.map( a => Utils.sanitize( a ) ).filter( Boolean );
  }

  private getUriByAlias ( alias: string ) : string | undefined {
    return [ ...this.index.values() ].find( ( { aliases } ) => aliases.includes( alias ) )?.uri;
  }

  private assertAvailableAlias ( alias: string, whitelist: string[] = [] ) : void {
    if ( this.has( alias ) ) throw new Error( `Alias ${ alias } conflicts with existing profile URI` );

    const owner = this.getUriByAlias( alias );
    if ( owner && ! whitelist.includes( owner ) ) throw new Error( `Alias ${ alias } already exists for profile ${ owner }` );
  }

  private resolveAliases ( uri: string, aliases: string[] = [], add: string[] = [], rmv: string[] = [] ) : string[] {
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
      const target = this.index.get( from ), match = this.find( to );
      if ( ! target || match.size > 1 ) throw new Error( 'Invalid move operation' );

      const foundKey = match.keys().next().value;
      if ( foundKey && foundKey !== from ) throw new Error( 'Destination already exists' );

      const item = { ...target, uri: to, aliases: this.resolveAliases(
        to, target.aliases, makeAlias ? [ from ] : [], [ to ]
      ) };

      this.index.delete( from );
      this.index.set( to, item );
      this.saveIndex();

      return item;
    }, `Failed to move profile index item ${ from } to ${ to }` ) ?? false;
  }

  public syncFromData ( data: TProfileData ) : TProfileIndexItem | false {
    const { uri, info: { name: { shortName: name } }, bio: { cv }, wiki: { desc, image } = {} } = data;
    const item = this.get( uri );

    return this.update( uri, { ...item,
      uri, name, desc, image: image?.thumb ?? image?.file,
      aliases: this.resolveAliases( uri, item?.aliases ),
      text: Utils.buildSearchText( cv )
    } );
  }

  // --- alias handling ---

  public hasAlias ( aliasLike: string, uriLike?: string ) : string | false {
    const owner = this.getUriByAlias( Utils.sanitize( aliasLike ) );

    if ( uriLike !== undefined && owner !== Utils.sanitize( uriLike ) ) return false;
    return owner ?? false;
  }

  public isAliasAvailable ( aliasLike: string ) : boolean {
    try { this.assertAvailableAlias( Utils.sanitize( aliasLike ) ); return true }
    catch { return false }
  }

  public removeAlias ( aliasLike: string ) : boolean {
    const alias = Utils.sanitize( aliasLike );
    log.debug( `Removing profile alias ${ alias }` );

    return log.catch( () => {
      for ( const item of this.index.values() ) {
        const index = item.aliases.indexOf( alias );

        if ( index >= 0 ) {
          item.aliases.splice( index, 1 );
          this.saveIndex();

          log.debug( `Removed alias ${ alias } from profile index item ${ item.uri }` );
          return true;
        }
      }

      return false;
    }, `Failed to remove profile alias ${ alias }` ) ?? false;
  }

  public addAliases ( uriLike: string, ...aliases: string[] ) : TProfileIndexItem | false {
    const uri = Utils.sanitize( uriLike );
    log.debug( `Adding profile aliases [${ aliases.join( ', ' ) }] to ${ uri }` );

    return log.catch( () => {
      const item = this.index.get( uri );
      if ( ! item ) throw new Error( `Profile index item ${ uri } not found` );
      if ( ! aliases.length ) return item;

      item.aliases = this.resolveAliases( uri, item.aliases, this.sanitizeAliases( aliases ) );
      this.saveIndex();

      return item;
    }, `Failed to add profile aliases to ${ uri }` ) ?? false;
  }

  public rmvAliases ( uriLike: string, ...aliases: string[] ) : TProfileIndexItem | false {
    const uri = Utils.sanitize( uriLike );
    log.debug( `Removing profile aliases [${ aliases.join( ', ' ) }] from ${ uri }` );

    return log.catch( () => {
      const item = this.index.get( uri );
      if ( ! item ) throw new Error( `Profile index item ${ uri } not found` );
      if ( ! aliases.length ) return item;

      item.aliases = this.resolveAliases( uri, item.aliases, [], this.sanitizeAliases( aliases ) );
      this.saveIndex();

      return item;
    }, `Failed to remove profile aliases from ${ uri }` ) ?? false;
  }

  // --- instantitate ---

  public static getInstance () : IProfileIndex {
    return ProfileIndex.instance ??= new ProfileIndex();
  }

  // --- rebuild index ---

  public static rebuildIndex () : boolean {
    return log.catch( () => {
      log.debug( 'Rebuild profile index ...' );
      const index = ProfileIndex.getInstance();
      let status = true;

      for ( const item of index.getIndex().values() ) {
        const profile = Profile.getByItem( item );

        if ( ! profile ) {
          log.warn( `Cannot index profile with URI ${ item.uri }` );
          continue;
        }

        status = status === true ? !! index.syncFromData( profile.getData() ) : false;
      }

      return status;
    }, 'Failed to rebuild profile index' ) ?? false;
  }
}
