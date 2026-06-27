#!/usr/bin/env node

import { Storage } from '@/core/Storage';


const storage = Storage.getInstance();

const lastRun = storage.readJSON< { lastRun: string } >( 'cron.json' );
const after = new Date( lastRun ? lastRun.lastRun : 0 );
const now = new Date();

storage.writeJSON( 'cron.json', { lastRun: now.toISOString() } );
