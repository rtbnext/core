#!/usr/bin/env node

import { JOBS } from '@/job/index';
import { Command } from 'commander';


const program = new Command();

for ( const JobClass of JOBS ) {
  const { id, desc, options } = JobClass.definition;
  const command = program.command( id ).description( desc );

  for ( const [ option, desc, required ] of options )
    command[ required ? 'requiredOption' : 'option' ]( option, desc );

  command.action( async () => {
    await new JobClass( process.argv.slice( 3 ) ).run();
  } );
}

await program.parseAsync();
