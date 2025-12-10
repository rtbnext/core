export const Gender = [ 'm', 'f', 'd' ] as const;
export type Gender = ( typeof Gender )[ number ];
