#!/usr/bin/env node

import { Command } from 'commander';

import { JOBS } from '@/job/index';


const program = new Command();

for ( const JobClass of JOBS ) {
  const { id, desc, options } = JobClass.definition;
  const command = program.command( id ).description( desc );

  for ( const { name, desc, parser, required } of options ) {
    const fn = required
      ? command.requiredOption.bind( command )
      : command.option.bind( command );

    if ( parser ) fn( name, desc, parser );
    else fn( name, desc );
  }

  command.action( async ( options ) => await new JobClass( options ).run() );
}

await program.parseAsync();
