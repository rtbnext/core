#!/usr/bin/env node

import { Storage } from '@/core/Storage';


const storage = Storage.getInstance();
const lastRun = storage.readJSON< { lastRun: string } >( 'cron.json' );
