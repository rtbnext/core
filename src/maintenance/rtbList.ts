import { Maintenance } from '../core/Maintenance';

class RTBList extends Maintenance {

    public async run () : Promise< void > {

        this.logger.info( `Fetch daily real-time billionaires list` );

        const res = await this.fetch.request( this.config.endpoints.list.replace( '{URI}', 'rtb' ) );

        //

    }

}

export const rtbList = new RTBList();
