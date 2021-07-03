import { readFileSync } from "fs";
import { Env } from "../../env/env";
import { getEndpoint } from "../../language_feaures/get-endpoint";
import { getPage } from "../../language_feaures/get-page";
import { getTag } from "../../language_feaures/get-tag";
import { toTree } from "../../language_feaures/to-tree";
import BrowserRepo from "../../object_storage/BrowserStorage";
import { BrowserMode } from "../../object_storage/enums/BrowserMode";
import Symbols from "../../symbols/symbols";
import { isSeq, MalBoolean, MalChromePage, MalKeyword, MalList, MalString, MalSymbol, MalType, Node } from "../../types/types";
import { evalExp } from "../evalExp";
import { read } from "../read";
import * as pup from 'puppeteer';

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

        case Symbols.TO_TREE: {
            const payloadExp = ast.list[1];
            let payload = null;

            if (payloadExp.type != Node.String) {
                payload = await evalExp(payloadExp, env);
            } else {
                payload = payloadExp;
            }
            const data = await toTree(payload);
            return data;
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

        case Symbols.GET_TAG: {
            
            const maybeAtom = ast.list[2];
            let atom = null;

            const maybePaylod = ast.list[1];
            let payload = null;

            if (maybeAtom.type != Node.Keyword) {
                atom = await evalExp(maybeAtom, env);
            } else {
                atom = maybeAtom;
            }
            
            if (maybePaylod.type != Node.MalJSON) {
                payload = await (evalExp(maybePaylod, env));
            } else {
                payload = maybePaylod;
            }

            const data = await getTag(payload, atom);
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

        case Symbols.START_CHROME: {
            const maybeMode = ast.list[1];
            let a: string = null;
            if (maybeMode.type != Node.Keyword)
            {
                var preFile = await evalExp(maybeMode, env);
                if (preFile.type != Node.Keyword) throw new Error(`Type Error: expected string, got ${preFile}`);
                a = preFile.v;
            } else {
                a = maybeMode.v;
            }
            var success: boolean = null;
            switch(a){
                case "headless":
                    success = await BrowserRepo.init(BrowserMode.Headless);
                    break;
                case "window":
                    success = await BrowserRepo.init(BrowserMode.Standard);
                    break;
                default: throw new Error(`Error: Atom must be either :headless or :window`);
            }
            return new MalBoolean(success);
        }

        case Symbols.NEW_PAGE: {
            const browser = BrowserRepo.get();
            const page = await (await browser).newPage();
            return new MalChromePage(page);
        }
        
        case Symbols.CHROME_GO_TO: {
            const maybeURL = ast.list[2];
            const maybePage = ast.list[1];

            let b: pup.Page = null;
            let a: string = null;

            if (maybeURL.type != Node.String)
            {
                var preFile = await evalExp(maybeURL, env);
                if (preFile.type != Node.String) throw new Error(`Type Error: expected string, got ${preFile}`);
                a = preFile.v;
            } else {
               a = maybeURL.v;
            }

            if (maybePage.type != Node.MalChromePage)
            {
                var preFile = await evalExp(maybePage, env);
                if (preFile.type != Node.MalChromePage) throw new Error(`Type Error: expected chromepage, got ${preFile}`);
                b = preFile.v;
            } else {
               b = maybePage.v;
            }
            await b.goto(a);
            return new MalChromePage(b);
        }

        case Symbols.KILL_CHROME: {
            try { await BrowserRepo.close(); }  
            catch (ex: any) { console.error(ex.message); return new MalBoolean(false)}
            return new MalBoolean(true);
        }
    }
}