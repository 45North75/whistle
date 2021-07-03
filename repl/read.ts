import { readStr } from "./funcs/reader";

export function read(str: string): any {
    str = str.replace(/\;((?=[^\n])[\s|\S])*/, "");
    return readStr(str);
}