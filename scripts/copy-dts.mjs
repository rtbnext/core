// scripts/copy-dts.mjs

import { cp, glob, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

try {
  const files = await Array.fromAsync( glob( 'src/**/*.d.ts' ) );

  if ( files.length === 0 ) {
    console.log( '[copy-dts] No .d.ts files found.' );
    process.exit( 0 );
  }

  await Promise.all( files.map( async ( file ) => {
    const target = file.replace( /^src[\\/]/, 'dist/' );
    await mkdir( dirname( target ), { recursive: true } );
    await cp( file, target );
  } ) );

  console.log( `[copy-dts] Copied ${ files.length } file(s).` );
} catch ( err ) {
  console.error( '[copy-dts] Failed:', err );
  process.exit( 1 );
}
