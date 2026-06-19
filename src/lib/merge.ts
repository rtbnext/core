import { ArrayMode, Merger } from '@komed3/deepmerge';


export const mergeReplace = new Merger( { arrayMode: ArrayMode.Replace } ).merge;
export const mergeKeep = new Merger( { arrayMode: ArrayMode.Keep } ).merge;
export const mergeConcat = new Merger( { arrayMode: ArrayMode.Concat } ).merge;
export const mergeUnique = new Merger( { arrayMode: ArrayMode.Unique } ).merge;
