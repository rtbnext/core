import { Job } from '@/abstract/Job';
import { ProfileIndex } from '@/model/ProfileIndex';
import type { TCommandJob, TJobClsOptions } from '@/type/job';
import { ProfileMerger } from '@/util/ProfileMerger';


export class ReconcileJob extends Job {
  private static index = ProfileIndex.getInstance();
  constructor ( options: TJobClsOptions = {} ) { super( options, 'reconcile', [ 'profile', 'system' ] ) }

  // --- job runner ---

  public override async run () : Promise< void > {
    await this.protect( async () => {
      const seen = new Set( ReconcileJob.index.keys );
      const owner = new Map( [ ...ReconcileJob.index.keys ].map( uri => [ uri, uri ] ) );
      const conflicts: Array< { target: string, uri: string, conflict: string } > = [];

      for ( const { uri, aliases } of ReconcileJob.index.values ) for ( const conflict of aliases ) {
        if ( seen.has( conflict ) )
          conflicts.push( { target: owner.get( conflict )!, uri, conflict } );
        else {
          seen.add( conflict );
          owner.set( conflict, uri );
        }
      }

      for ( const { target, uri, conflict } of conflicts ) {
        if ( target === conflict ) {
          ReconcileJob.index.rmvAliases( target, conflict );
          continue;
        }

        ReconcileJob.index.rmvAliases( uri, conflict );
      }
    } );
  }

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'reconcile',
    desc: 'Detect and resolve URI-alias conflicts'
  } as const;
}
