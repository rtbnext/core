#!/usr/bin/env node

import { JOBS } from '@/job/index';
import { Command } from 'commander';


const program = new Command();

for ( const JobClass of JOBS ) {}

await program.parseAsync();
