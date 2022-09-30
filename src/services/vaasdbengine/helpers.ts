import crypto from 'crypto';

export function hasher(queryString: string, queryParameters: any) {
    let toHash = queryString;
    if (queryParameters && queryParameters.length > 0) {
        toHash += queryParameters.toString();
    }
    return crypto.createHash('sha1').update(toHash).digest('hex');
}

export enum cachingType {
    StandardCache = 60,
    NoCache = 0,
}


export interface VaasPgQueryResponseInterface {
    queryResponse: any;
    duration: number;
    cache: boolean;
}