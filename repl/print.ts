import { MalType } from "../types/types";
import { prStr } from "./funcs/printer";

export function print(exp: MalType): string
{
    return prStr(exp);
}