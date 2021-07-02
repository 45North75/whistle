import { Env } from "../../env/env";
import { getPage } from "../../language_feaures/get-page";
import Symbols from "../../symbols/symbols";
import { isSeq, MalList, MalString, MalSymbol, Node } from "../../types/types";
import { evalExp } from "../evalExp";

export async function isSymbol(first: MalSymbol, ast: MalList, env: Env)
{
    switch(first.v) 
    {
        case Symbols.DEF: {
            const [, key, value] = ast.list;
            if (key.type !== Node.Symbol) throw new Error(`Unexpected token type :${key.type}. Expected symbol.`);
            if (!value) throw new Error("Syntax error.");

            var evaledExp = await evalExp(value, env);
            return env.set(key, evaledExp);
        }

        case Symbols.LET: {
            let letEnv = new Env(env);
            const pairs = ast.list[1];
            
            if (!isSeq(pairs)) throw new Error(`Unexpected token type ${pairs.type}. Expected a list or vector.`);

            const list = pairs.list;
            var iterator = new Array(list.length).filter(entry => (entry % 2) == 0);
            for(var it of iterator)
            {
                const key = list[it];
                const value = list[it + 1];
                if (key.type !== Node.Symbol) throw new Error(`Unexpected token type ${key.type}. Expected symbol`);
                if (!key || !value) throw new Error("Syntax error");

                var evalResult = await evalExp(value, letEnv);
                letEnv.set(key, evalResult);
            }
            var evalResultFinal = evalExp(ast.list[2], letEnv);
            return evalResultFinal;
        }

        case Symbols.GET_PAGE: {
            const [,url] = ast.list;
            const data = await getPage(url);
            return new MalString(data);
        }
    }
}