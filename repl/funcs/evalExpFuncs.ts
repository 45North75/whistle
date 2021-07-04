import { readFileSync } from "fs";
import { Env } from "../../env/env";
import { getEndpoint } from "../../language_feaures/get-endpoint";
import { getPage } from "../../language_feaures/get-page";
import Symbols from "../../symbols/symbols";
import {  isSeq, MalBoolean, MalFunction, MalList, MalNil, MalString, MalSymbol, MalType, Node, WrappedFunction } from "../../types/types";
import { evalExp } from "../evalExp";
import { read } from "../read";
import { ns } from "./core";

/// This function contains either functions which are very large,
/// or return promises (are async). 
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

        case Symbols.FMAP: {
            const elms: MalList = ast.list[2] as MalList;
            const func: MalFunction = ast.list[1] as MalFunction;
            const proms = elms.list.map(elm => evalExp(func, new Env(env, [elm[1]], [elm[1]])));
            const malList = await Promise.all(proms);
            return new MalList(malList);
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

        case Symbols.IF: {
            const [, cond, thenExpr, elseExrp] = ast.list;
            const ret = await evalExp(cond, env);
            let b = true;
            if (ret.type === Node.Boolean && !ret.v) {
                b = false;
            } else if (ret.type === Node.Nil) {
                b = false;
            }
            if (b) {
                return await evalExp(thenExpr, env);
            } else if (elseExrp) {
                return await evalExp(elseExrp, env);
            } else {
                return MalNil.instance;
            } 
        }

        case Symbols.FN: {
            const [, args, binds] = ast.list;
            if (!isSeq(args)) {
                throw new Error(`unexpected return type: ${args.type}, expected: list or vector`);
            }
            const symbols = args.list.map(param => {
                if (param.type !== Node.Symbol) {
                    throw new Error(`unexpected return type: ${param.type}, expected: symbol`);
                }
                return param;
            });
            return new WrappedFunction(env, symbols, binds);
        }

        case Symbols.GET_PAGE: {
            const urlExp = ast.list[1];
            let url = null;

            if (urlExp.type != Node.String) {
                url = await evalExp(urlExp, env);
            } else {
                url = urlExp;
            }
            const data = await getPage(url);
            return new MalString(data);
        }

        case Symbols.GET_ENDPOINT: {
            const urlExp = ast.list[1];
            let url = null;

            if (urlExp.type != Node.String) {
                url = await evalExp(urlExp, env);
            } else {
                url = urlExp;
            }
            const data = await getEndpoint(url);
            return data;
        }
        
        case Symbols.X_FILE: {
            
            const maybeFilename = ast.list[1];
            let filename: string = null;

            if (maybeFilename.type != Node.String)
            {
                var preFile = await evalExp(maybeFilename, env);
                if (preFile.type != Node.String) throw new Error(`Type Error: expected string, got ${preFile.type}`);
                filename = preFile.v as string;
            } else {
                filename = maybeFilename.v as string;
            }
            

            if (!filename.includes(".lisp")) throw new Error(`The file ${filename} is not a whistle file.`);

            const fileFull = readFileSync(filename, "utf-8").replace(/\;((?=[^\n])[\s|\S])*/g, "")
            const cleanedFile = fileFull.split("\n").join("").replace(/\)\s*\(/gi, ");-;(").split(";-;");
            var result: MalType = null;

            for (var line of cleanedFile) 
            {
                if (line == null) break;
                if (line === "") continue;
                try {
                    result = await evalExp(read(line), env);
                } catch(ex: any)    
                {
                    console.error(ex.message);
                }
            }
            return result;
        }

        case Symbols.HOT_REFRESH: {
            env.data = new Map();
            ns.forEach((value, key) => {
                env.set(key, value);
            });
            return new MalBoolean(true);
        }
    }
}