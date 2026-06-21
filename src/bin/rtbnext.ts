#!/usr/bin/env node

import { Command } from 'commander';

import { JOBS } from '@/job/index';


const addGlobalOptions = ( command: Command ) : void => void command
  .optionsGroup( 'Global Options:' )
  .option( '-s, --silent', 'Disable logging' )
  .option( '--safe-mode', 'Enable safe mode' );

const program = new Command();

program
  .name( 'ntbnext' )
  .description( 'CLI to manage the @rtbnext database' )
  .version( '2.0.0' );

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

  addGlobalOptions( command );
  command.action( async ( options ) => await new JobClass( options ).run() );
}

await program.parseAsync();
