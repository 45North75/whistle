import { Env } from "../env/env";
import Symbols from "../symbols/symbols";
import { isSeq, MalType, Node } from "../types/types";
import { astEval } from "./astEval";
import { isSymbol } from "./funcs/evalExpFuncs";

export async function evalExp(ast: MalType, env: Env): Promise<MalType> {
    if(ast.type !== Node.List) return await astEval(ast, env);
    if (ast.list.length === 0) return ast;

    const first = ast.list[0];
    switch (first.type) 
    {
        case Node.Symbol: {
            var firstCheck = Symbols.SymbolListing.filter(symbol => first.v == symbol);
            if (firstCheck.length != 0) return await isSymbol(first, ast, env);
        }
    }

    const result = await astEval(ast, env);

    if (!isSeq(result)) throw new Error(`Unexpected type returned ${result.type}. Expected a list or a vector.`);

    const [f, ...args] = result.list;

    if ((f.type !== Node.Function) && (f.type != Node.WrappedFunction)) throw new Error(`Unexpected token ${f.type}. Expected a function.`);

    return await f.func(...args);
}