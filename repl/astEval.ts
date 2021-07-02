import { Env } from "../env/env";
import { MalHashMap, MalList, MalType, MalVector, Node } from "../types/types";
import { evalExp } from "./evalExp";

export async function astEval(ast: MalType, env: Env): Promise<MalType>
{
    switch(ast.type)
    {
        case Node.Symbol: {
            const f = env.get(ast);
            if (!f) throw new Error(`Unknown symbol ${ast.v}.`);
            return f;
        }

        case Node.List: {
            var promises = ast.list.map(async (subAst) => await evalExp(subAst, env));
            var astPromisesResolved = await Promise.all(promises);
            return new MalList(astPromisesResolved);
        }

        case Node.Vector: {
            var promises = ast.list.map(async (subAst) => await evalExp(subAst, env));
            var astPromisesResolved = await Promise.all(promises);
            return new MalVector(astPromisesResolved);
        }

        case Node.HashMap: {
            const list: Array<MalType> = [];
            for(const [key, value] of ast.entries()){
                list.push(key);
                var listResult = await evalExp(value, env);
                list.push(listResult);
            }
            return new MalHashMap(list);
        }

        default: {
            return ast;
        }
    }
}