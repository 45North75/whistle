import axios from 'axios';
import { MalString, MalType } from '../types/types';

export async function getPage(url: MalType): Promise<string> {
    url = url as MalString;
    const payload = await axios.get(url.v);
    return payload.data;
}