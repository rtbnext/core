import type { TFilterCollection } from '@rtbnext/schema/src/model/filter';

import { Storage } from '@/core/Storage';
import type { IFilter } from '@/interface/filter';


export class Filter implements IFilter {
  private static readonly storage = Storage.getInstance();
  private static instance: IFilter;

  private data: Partial< TFilterCollection > = {};
}
