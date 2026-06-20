#!/usr/bin/env node

import { JOBS } from '@/job/index';
import { Command } from 'commander';


const program = new Command();

for ( const JobClass of JOBS ) {
  const { id, name, desc, options } = JobClass.definition;
  const command = program.command( id ).name( name ).description( desc );
}

await program.parseAsync();
