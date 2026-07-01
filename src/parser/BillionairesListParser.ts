import type { IBillionairesListParser } from '@/interface/parser';
import { PersonListParser } from '@/parser/PersonListParser';


export class BillionairesListParser extends PersonListParser implements IBillionairesListParser {}
