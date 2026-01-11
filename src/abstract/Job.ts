import { Config } from '@/core/Config';
import { log } from '@/core/Logger';
import { Utils } from '@/core/Utils';
import { IJob } from '@/interfaces/job';
import { Parser } from '@/parser/Parser';
import { TLoggingLevel } from '@/types/config';
import { TArgs } from '@/types/generic';

export abstract class Job implements IJob {

    protected static readonly config = Config.getInstance();

    protected readonly job: string;
    protected readonly args: TArgs = {};
    protected readonly silent: boolean;
    protected readonly safeMode: boolean;

    constructor ( args: string[], job: string ) {
        this.job = job;
        this.args = Utils.parseArgs( args );

        const { silent, safeMode } = Job.config.job;
        this.silent = this.args.silent !== undefined ? this.truthy( this.args.silent ) : silent;
        this.safeMode = this.args.safeMode !== undefined ? this.truthy( this.args.safeMode ) : safeMode;

        this.log( `Run job`, this.args );
    }

    // Job helper

    protected log ( msg: string, meta?: any, as: TLoggingLevel = 'info' ) : void {
        if ( ! this.silent ) log[ as ]( `[${this.job}] ${msg}`, meta );
    }

    protected err ( err: unknown, msg?: string ) : void {
        if ( ! this.silent ) log.errMsg( err, msg ? `[${this.job}] ${msg}` : undefined );
    }

    protected async protect<
        F extends ( ...args: any[] ) => any,
        R = Awaited< ReturnType< F > >
    > ( fn: F ) : Promise< R | undefined > {
        try { return await fn() }
        catch ( err ) {
            if ( ! this.silent ) this.err( err );
            if ( ! this.safeMode ) throw err;
        }
    }

    protected truthy ( value: any ) : boolean {
        return Parser.boolean( value );
    }

    protected split ( value: any ) : string[] {
        return Parser.string( value ).split( ',' ).filter( Boolean );
    }

    // Job getter

    public getJobName () : string {
        return this.job;
    }

    public getArgs () : TArgs {
        return this.args;
    }

    public isSilent () : boolean {
        return this.silent;
    }

    public isSafeMode () : boolean {
        return this.safeMode;
    }

    // Abstract job runner

    public abstract run ( ...args: any[] ) : void | Promise< void >;

}

export async function jobRunner< T extends typeof Job > (
    cls: T, method: keyof InstanceType< T > = 'run',
    trigger: string = '--run', ...opt: string[]
) : Promise< void > {
    if ( ! process.argv.includes( trigger ) ) return;

    await log.catchAsync( async () => {
        const args = [ ...new Set( [ ...opt, ...process.argv.slice( 2 ) ] ) ];
        const job = new ( cls as any )( args ); await ( job[ method ] as any )();
    }, `Failed to run job ${cls.name}` );
}
