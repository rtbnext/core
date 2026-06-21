import { Job } from '@/abstract/Job';
import { Fetch } from '@/core/Fetch';
import { ProfileQueue } from '@/core/Queue';
import { Stats } from '@/model/Stats';
import { Parser } from '@/parser/Parser';
import type { TJobClsOptions, TJobDefinition } from '@/type/job';
import type { TPersonList } from '@/type/response';


export class RTBJob extends Job {
  private static readonly fetch = Fetch.getInstance();
  private static readonly queue = ProfileQueue.getInstance();
  private static readonly stats = Stats.getInstance();

  constructor ( options: TJobClsOptions ) { super( options, 'rtb' ) }

  // --- job runner ---

  public async run () : Promise< void > {
    await this.protect( async () => {
      const res = await RTBJob.fetch.list< TPersonList >( 'rtb', '0' );
      if ( ! res?.success || ! res.data ) throw new Error( 'Request failed' );

      const rawList = res.data.personList.personsLists;
      const date = Parser.date( rawList[ 0 ].timestamp, 'ymd' )!;

      if ( RTBJob.stats.getGlobalStats().date === date ) {
        this.log( 'RTB list is already up to date' );
        return;
      }
    } );
  }

  // --- command definition ---

  public static readonly definition: TJobDefinition = {
    id: 'rtb',
    desc: 'Proceed daily real-time billionaires list',
    options: []
  } as const;
}
