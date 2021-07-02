import { Env } from "../env/env";
import { evalExp } from "./evalExp";
import { print } from "./print";
import { read } from "./read";

export async function rep(str: string, env: Env): Promise<string> 
{
    var result = await evalExp(read(str), env);
    return print(result);
}