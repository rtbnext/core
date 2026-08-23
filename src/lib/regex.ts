export const REGEX_DIACRITICS = /[\u0300-\u036f]/g;

export const REGEX_SPACES = /\s+/g;
export const REGEX_SPACE_DELIMITER = /\s+/;
export const REGEX_NEWLINE = /[\n\r]+/g;

export const REGEX_NAME_CLEANUP = /[^\p{L}\s\-().']/gu;
export const REGEX_NAME_TRIM = /^[\s.'-]+|[\s'-]+$/g;
export const REGEX_SEARCH_CLEANUP = /[^a-z0-9\s-]/g;

export const REGEX_NOALNUM = /[^a-z0-9]+/g;
export const REGEX_NONUM = /[^\d]+/g;

export const REGEX_QUOTES = /"([^"]+)"/g;

export const REGEX_FAMILY = /\s*(?:(&|and)\s*)?famil(?:y|ies)\b\s*$/i;
export const REGEX_GROUP = /,|\band\b(?!\s+famil(?:y|ies)\b)|&\s*(?!famil(?:y|ies)\b)/i;
export const REGEX_SUFFIX = /^(?:jr\.?|sr\.?|sen\.?|m{0,3}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})\.?)$/i;

export const REGEX_LOWER_START = /^[a-z]/;

export const REGEX_URI_CLEANUP = /(?:-(?:and-)?(?:family|families)|-\d+)+$/i;
