import { Config } from '../core/Config';
import { Fetch } from '../core/Fetch';

export async function fetchRTB () {

    const config = Config.getInstance().getAPIConfig();
    const fetch = Fetch.getInstance();

    const res = await fetch.request( config.endpoints.list.replace( '{URI}', 'rtb' ) );
    if ( ! res.success ) return;

    // proceed data ...

}

// Runner
( async () => { if ( process.argv.includes( '--run' ) ) await fetchRTB() } )();
