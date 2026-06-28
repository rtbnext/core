#!/usr/bin/env node

import { Cron } from '@/core/Cron';


const cron = Cron.getInstance();
await cron.run();
