import type { TMover } from '@rtbnext/schema/src/model/mover';

import { Snapshot } from '@/abstract/Snapshot';
import type { IMover } from '@/interface/mover';


export class Mover extends Snapshot< TMover > implements IMover {
  private static instance: Mover;
  private constructor () { super( 'mover', 'json' ) }
}
