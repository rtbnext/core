import { cp, glob, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';


for await ( const file of glob( 'src/**/*.d.ts' ) ) {
  const target = file.replace( /^src[\\/]/, 'dist/' );

  await mkdir( dirname( target ), { recursive: true } );
  await cp( file, target );
}
