import { TListResponse } from '@/types/response';

export class ListParser< T extends TListResponse[ 'personList' ][ 'personsLists' ][ number ] > {

    constructor ( private readonly res: T ) {}

}
