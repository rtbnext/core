import { Job } from '@/abstract/Job';
import { Utils } from '@/core/Utils';
import { Profile } from '@/model/Profile';
import type { TJobCommand, TMoveJobOptions } from '@/type/job';


export class MoveJob extends Job< TMoveJobOptions > {
  constructor ( options: TMoveJobOptions ) { super( options, 'move' ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {
      const makeAlias = !! this.options.makeAlias;
      const source = Utils.sanitize( this.options.source );
      const target = Utils.sanitize( this.options.target );

      if( ! source || ! target ) throw new Error( 'Invalid from/to profile names' );

      const profile = Profile.find( source );
      if ( ! profile ) throw new Error( `Profile ${ source } not found` );

      this.log( `Moving profile from ${ source } to ${ target } ...` );
      const res = profile.move( target, makeAlias );

      if ( ! res ) throw new Error( `Failed to move profile from ${ source } to ${ target }` );
      this.log( `Profile moved successfully to ${ target }${ makeAlias ? ' with alias' : '' }` );
    } );
  }

  // --- command definition ---

  public static readonly definition: TJobCommand = {
    id: 'move',
    desc: 'Move a profile from one URI to another',
    options: [ {
      name: '-s, --source <URI>',
      desc: 'Source profile URI to move from',
      required: true
    }, {
      name: '-t, --target <URI>',
      desc: 'Target profile URI to move to',
      required: true
    }, {
      name: '-a, --make-alias',
      desc: 'Whether to create an alias from the old URI to the new one'
    } ]
  } as const;
}
