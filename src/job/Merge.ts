import { Job } from '@/abstract/Job';
import type { TJobDefinition, TMergeJobOptions } from '@/type/job';


export class MergeJob extends Job< TMergeJobOptions > {
  constructor ( options: TMergeJobOptions ) { super( options, 'merge' ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {
      const { list, source, target, dryRun, force, makeAlias } = this.options;
    } );
  }

  // --- command definition ---

  public static readonly definition: TJobDefinition = {
    id: 'merge',
    desc: 'Merge two profiles safely',
    options: [ {
      name: '-l, --list',
      desc: 'Find and list all merge candidates'
    }, {
      name: '-s, --source <URI>',
      desc: 'Source profile URI to merge from'
    }, {
      name: '-t, --target <URI>',
      desc: 'Target profile URI to merge into'
    }, {
      name: '--dry-run',
      desc: 'Perform a dry run of the merge without making any changes'
    }, {
      name: '--force',
      desc: 'Force the merge even if there are potential conflicts'
    }, {
      name: '-a, --make-alias',
      desc: 'Whether to create an alias from the old URI to the new one after merge'
    } ]
  } as const;
}
