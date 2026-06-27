#!/usr/bin/env node

import { Storage } from '@/core/Storage';
import { JOBS } from '@/job/index';


const storage = Storage.getInstance();

const lastRun = storage.readJSON< { lastRun: string } >( 'cron.json' );
const after = new Date( lastRun ? lastRun.lastRun : 0 );
const now = new Date(), before = new Date( after.getTime() + 3e5 );

for ( const JobClass of JOBS ) {
  if ( ! ( 'cron' in JobClass ) ) continue;

  for ( const { cronexpr, options } of JobClass.cron ) {
    //
  }
}

storage.writeJSON( 'cron.json', { lastRun: now.toISOString() } );
