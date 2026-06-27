#!/usr/bin/env node

import { Storage } from '@/core/Storage';
import { JOBS } from '@/job/index';


const storage = Storage.getInstance();

const lastRun = storage.readJSON< { lastRun: string } >( 'cron.json' );
const after = new Date( lastRun ? lastRun.lastRun : 0 );
const now = new Date();

for ( const JobClass of JOBS ) {
  if ( ! ( 'cron' in JobClass ) ) continue;
}

storage.writeJSON( 'cron.json', { lastRun: now.toISOString() } );
