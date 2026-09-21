import { Job } from '@/abstract/Job';
import { Parser } from '@/parser/Parser';
import type { TCommandJob, TImageJobOptions } from '@/type/job';


export class ImageJob extends Job< TImageJobOptions > {
  constructor ( options: TImageJobOptions ) { super( options, 'image', [ 'system' ] ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {} );
  };

  // --- command definition ---

  public static readonly command: TCommandJob = {
    id: 'image',
    desc: 'Remove profile images and clean up orphaned images',
    options: [ {
      name: '-r, --remove <URIs>',
      desc: 'Remove specific profile images by URI (comma-separated)',
      parser: ( v: string ) => Parser.list( v, 'string', ',' )
    }, {
      name: '-c, --cleanup',
      desc: 'Cleanup orphaned images'
    } ]
  } as const;
}
