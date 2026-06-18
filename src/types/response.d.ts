export type TResponse< T > = {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  duration: number;
  retries: number;
};

export type TWaybackResponse = {
  archived_snapshots: {
    closest?: {
      status: string;
      available: boolean;
      url: string;
      timestamp: string;
    };
  };
};

export type TProfileResponse = {
  person: {
    naturalId: string;
    name: string;
    listImages?: Array< {
      image: string;
      uri: string;
      caption: string;
      description: string;
      title: string;
      credit: string;
    } >;
    geoLocation?: {
      longitude: number;
      latitude: number;
    };
    relatedEntities?: Array< {
      name: string;
      type: string;
      uri?: string;
      relationshipType?: string;
    } >;
    uri: string;
    dropOff: boolean;
    uris: string[];
    industries: string[];
    embargo?: boolean;
    firstName?: string;
    lastName?: string;
    birthDate?: number;
    finalWorth: number;
    finalWorthDate: number;
    stateProvince?: string;
    city?: string;
    numberOfChildren?: number;
    maritalStatus?: 'M' | 'F';
    source: string;
    title?: string;
    organization?: string;
    asianFormat?: 'N' | 'Y';
    personLists: Array< {
      listUri: string;
      name: string;
      listDescription?: string;
      rank?: number;
      finalWorth?: number;
      timestamp: number | string;
      financialAssets?: Array< {
        exchange: string;
        ticker: string;
        companyName: string;
        numberOfShares?: number;
        sharePrice: number;
        exchangeRate?: number;
        currentPrice?: number;
      } >;
      date?: number | string;
      estWorthPrev?: number;
      privateAssetsWorth?: number;
      familyList?: boolean;
      archivedWorth?: number;
      bios?: string[];
      abouts?: string[];
      philanthropyScore?: number;
    } >;
    educations?: Array< {
      school: string;
      degree: string;
    } >;
    selfMade?: boolean;
    gender: string;
    countryOfCitizenship: string;
    countryOfResidence?: string;
    birthCity?: string;
    birthState?: string;
    birthCountry?: string;
    deceased: boolean;
    selfMadeType?: string;
    selfMadeRank?: number;
    quote?: string;
  };
};

export type TPersonList = {
  naturalId: string;
  name: string;
  year: number;
  listUri: string;
  uri: string;
  rank?: number;
  finalWorth?: number;
  person?: {
    name?: string;
    uri?: string;
  },
  personName: string;
  state?: string;
  city?: string;
  source?: string;
  industries?: string[];
  countryOfCitizenship?: string;
  timestamp: number;
  gender?: 'M' | 'F';
  birthDate?: number;
  lastName?: string;
  financialAssets?: Array< {
    exchange: string;
    ticker: string;
    companyName: string;
    numberOfShares?: number;
    sharePrice?: number;
    currencyCode?: string;
    exchangeRate?: number;
    currentPrice?: number;
  } >;
  date?: number;
  estWorthPrev?: number;
  privateAssetsWorth?: number;
  archivedWorth?: number;
  csfDisplayFields: string[];
  bios?: string[];
  abouts?: string[];
};

export type TListResponse< T extends object > = {
  personList: {
    count: number;
    personsLists: Array< T >;
  };
};

export type TWikidataProp =
  | 'gender' | 'birthdate' | 'article' | 'image' | 'iso2' | 'occupation' | 'employer'
  | 'ownerOf' | 'netWorth';

export type TWikidataResponseItem = {
  item: { value: string };
  itemLabel: { value: string, xmlLang: string };
} & { [ K in TWikidataProp ]?: {
  value: string;
} };

export interface TWikidataResponse {
  results: { bindings: TWikidataResponseItem[] };
}
