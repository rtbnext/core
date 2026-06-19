import { type ArrayMode, Merger } from '@komed3/deepmerge';


const cache: { [ key: string ]: Merger } = {};

export const merge = ( mode: ArrayMode ) => (
  cache[ mode ] ??= new Merger( { arrayMode: mode } )
).merge;
