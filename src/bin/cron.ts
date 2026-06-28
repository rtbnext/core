#!/usr/bin/env node

import { prev } from 'nxtcron';

import { Storage } from '@/core/Storage';
import { JOBS } from '@/job/index';


const storage = Storage.getInstance();
const lastRun = storage.readJSON< { lastRun: string } >( 'cron.json' );
const now = new Date();

if ( ! lastRun ) {
  storage.writeJSON( 'cron.json', { lastRun: now.toISOString() } );
  return;
}

console.log( new Date(), prev( '* * * * *', { before: new Date(), after: new Date( Date.now() - 3e5 ), count: 99 } ) );

/*import { Storage } from '@/core/Storage';
import { JOBS } from '@/job/index';


const storage = Storage.getInstance();
const lastRun = storage.readJSON< { lastRun: string } >( 'cron.json' );

const before = new Date( Math.ceil( Date.now() / 3e5 ) * 3e5 );
const after = lastRun ? new Date( lastRun.lastRun ) : new Date( before.getTime() - 3e5 );

for ( const JobClass of JOBS ) {
  if ( ! ( 'cron' in JobClass ) ) continue;

  for ( const { cronexpr, options } of JobClass.cron ) {
    const date = prev( cronexpr, { count: 1, timezone: 'UTC', before } );
    if ( date && date[ 0 ] > after ) console.log( JobClass.command.id, date[ 0 ] );
  }
}*/

//storage.writeJSON( 'cron.json', { lastRun: now.toISOString() } );
