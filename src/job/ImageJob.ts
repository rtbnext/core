import { Job } from '@/abstract/Job';
import { Image } from '@/core/Image';
import { Parser } from '@/parser/Parser';
import type { TCommandJob, TCronJob, TImageJobOptions } from '@/type/job';


export class ImageJob extends Job< TImageJobOptions > {
  private static readonly image = Image.getInstance();

  constructor ( options: TImageJobOptions ) { super( options, 'image', [ 'system' ] ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {
      for ( const uri of this.options.remove ?? [] ) ImageJob.image.remove( uri );
      if ( this.options.cleanup ) ImageJob.image.clean();
    } );
  }

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

  // --- cron job definition ---

  public static readonly cron: TCronJob< TImageJobOptions > = [ {
    cronexpr: '10 0 1 * *', // run at 0:10 on the first day of every month,
    options: () => ( { cleanup: true } )
  } ] as const;
}
