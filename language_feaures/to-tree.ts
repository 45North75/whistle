import * as cherrio from 'cheerio';
import { MalPage, MalString, MalSymbol, MalType } from '../types/types';

export async function toTree(page: MalType): Promise<MalType>
{
    page = page as MalString;
    const instance = cherrio.load(page.v);
    const mp = new MalPage(instance);
    return mp;
}