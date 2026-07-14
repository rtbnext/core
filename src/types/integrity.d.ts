export type TValidateState = {
  flags: string[];
  invalid: boolean;
  penalty: number;
};

export type TIntegrityCheck = readonly ( readonly [
  check: unknown,
  flag: string,
  penalty: number,
  invalid: boolean
] )[];
