import { Job } from '@/abstract/Job';
import { Utils } from '@/core/Utils';
import { Profile } from '@/model/Profile';
import type { TJobDefinition, TMoveJobOptions } from '@/type/job';


export class MoveJob extends Job< TMoveJobOptions > {
  constructor ( options: TMoveJobOptions ) { super( options, 'Move' ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {
      const from = Utils.sanitize( this.options.from ), to = Utils.sanitize( this.options.to );
      const makeAlias = !! this.options.makeAlias;
      if( ! from || ! to ) throw new Error( 'Invalid from/to profile names' );

      const profile = Profile.find( from );
      if ( ! profile ) throw new Error( `Profile ${ from } not found` );

      this.log( `Moving profile from ${ from } to ${ to } ...` );
      const res = profile.move( to, makeAlias );

      if ( ! res ) throw new Error( `Failed to move profile from ${ from } to ${ to }` );
      this.log( `Profile moved successfully to new URI "${ to }"` + makeAlias ? ' with alias' : '' );
    } );
  }

  // --- command definition ---

  public static readonly definition: TJobDefinition = {
    id: 'move',
    desc: 'Move a profile from one URI to another',
    options: [ {
      name: '--from <URI>',
      desc: 'The profile URI to move from',
      required: true
    }, {
      name: '--to <URI>',
      desc: 'The profile URI to move to',
      required: true
    }, {
      name: '--make-alias',
      desc: 'Whether to create an alias from the old URI to the new one'
    } ]
  } as const;
}
