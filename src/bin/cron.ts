#!/usr/bin/env node

import { run } from '@/core/Cron';
import { log } from '@/core/Logger';


await run().catch( err => log.errMsg( err, 'Unhandled exception caught during job execution' ) );
