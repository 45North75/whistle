import { Env } from "../env/env";
import { evalExp } from "../repl/evalExp";
import * as pup from 'puppeteer';

export type MalType = MalList 
| MalNumber 
| MalString 
| MalNil 
| MalBoolean 
| MalSymbol 
| MalKeyword 
| MalVector 
| MalHashMap 
| MalFunction
| MalAtom 
| WrappedFunction
| MalPage 
| MalJSON 
| MalElements
| MalChromePage;

type MalF = (...args: (MalType | undefined)[]) => MalType;

export const enum Node {
    List = 1,
    Number,
    String,
    Nil,
    Boolean,
    Symbol,
    Keyword,
    Vector,
    HashMap,
    Function,
    Atom,
    WrappedFunction,
    MalPage,
    MalJSON,
    MalElements,
    MalChromePage,
}

export function equals(a: MalType, b: MalType, strict?: boolean): boolean {
    if (strict && a.type !== b.type) {
        return false;
    }

    if (a.type === Node.Nil && b.type === Node.Nil) {
        return true;
    }
    if (isSeq(a) && isSeq(b)) {
        return listEquals(a.list, b.list);
    }
    if (a.type === Node.HashMap && b.type === Node.HashMap) {
        if (a.keywordMap.size !== b.keywordMap.size) {
            return false;
        }
        if (Object.keys(a.stringMap).length !== Object.keys(b.stringMap).length) {
            return false;
        }
        for (const [aK, aV] of a.entries()) {
            if (aK.type !== Node.String && aK.type !== Node.Keyword) {
                throw new Error(`unexpected symbol: ${aK.type}, expected: string or keyword`);
            }
            const bV = b.get(aK);
            if (aV.type === Node.Nil && bV.type === Node.Nil) {
                continue;
            }
            if (!equals(aV, bV)) {
                return false;
            }
        }

        return true;
    }
    if (
        (a.type === Node.Number && b.type === Node.Number)
        || (a.type === Node.String && b.type === Node.String)
        || (a.type === Node.Boolean && b.type === Node.Boolean)
        || (a.type === Node.Symbol && b.type === Node.Symbol)
        || (a.type === Node.Keyword && b.type === Node.Keyword)
    ) {
        return a.v === b.v;
    }

    return false;

    function listEquals(a: MalType[], b: MalType[]): boolean {
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i], strict)) {
                return false;
            }
        }
        return true;
    }
}

export function isSeq(ast: MalType): ast is MalList | MalVector {
    return ast.type === Node.List || ast.type === Node.Vector;
}

export function isAST(v: MalType): v is MalType {
    return !!v.type;
}


export class MalChromePage {
    type: Node.MalChromePage = Node.MalChromePage;
    meta?: MalType;
    
    constructor(public v: pup.Page) {
    }

    withMeta(meta: MalType) {
        const v = new MalChromePage(this.v);
        v.meta = meta;
        return v;
    }
}


export class MalElements {
    type: Node.MalElements = Node.MalElements;
    meta?: MalType;
    
    constructor(public v: Array<cheerio.Element>){
    }

    withMeta(meta: MalType) {
        const v = new MalElements(this.v);
        v.meta = meta;
        return v;
    }
}

export class MalPage {
    type: Node.MalPage = Node.MalPage;
    meta?: MalType;
    
    constructor(public v: cheerio.Root){
    }

    withMeta(meta: MalType) {
        const v = new MalPage(this.v);
        v.meta = meta;
        return v;
    }
}

export class WrappedFunction {
    type: Node.WrappedFunction = Node.WrappedFunction;
    meta?: MalType;
    constructor(public env: Env, public symbols: MalSymbol[], public binds: MalType){}

    public async func(...args: MalType[]): Promise<MalType> {
        return evalExp(this.binds, new Env(this.env, this.symbols, args));
    }

    withMeta(meta: MalType){
        const v = new WrappedFunction(this.env, this.symbols, this.binds);
        v.meta = meta;
        return v;
    }
}

export class BasicFunction {
    type: Node.WrappedFunction = Node.WrappedFunction;
    meta?: MalType;
    constructor(public env: Env, public symbols: MalSymbol[], public binds: MalType){}

    public async func(...args: MalType[]): Promise<MalType> {
        return evalExp(this.binds, new Env(this.env, this.symbols, args));
    }

    withMeta(meta: MalType){
        const v = new WrappedFunction(this.env, this.symbols, this.binds);
        v.meta = meta;
        return v;
    }
}

export class MalJSON {
    type: Node.MalJSON = Node.MalJSON;
    meta?: MalType;
    
    constructor(public v: object){
    }

    withMeta(meta: MalType){
        const v = new MalJSON(this.v);
        v.meta = meta;
        return v;
    }
}

export class MalList {
    type: Node.List = Node.List;
    meta?: MalType;

    constructor(public list: MalType[]) {
    }

    withMeta(meta: MalType) {
        const v = new MalList(this.list);
        v.meta = meta;
        return v;
    }
}

export class MalNumber {
    type: Node.Number = Node.Number;
    meta?: MalType;

    constructor(public v: number) {
    }

    withMeta(meta: MalType) {
        const v = new MalNumber(this.v);
        v.meta = meta;
        return v;
    }
}

export class MalString {
    type: Node.String = Node.String;
    meta?: MalType;

    constructor(public v: string) {
    }

    withMeta(meta: MalType) {
        const v = new MalString(this.v);
        v.meta = meta;
        return v;
    }
}

export class MalNil {

    private static _instance?: MalNil;

    static get instance(): MalNil {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new MalNil();
        return this._instance;
    }

    type: Node.Nil = Node.Nil;
    meta?: MalType;

    private constructor() { }

    withMeta(_meta: MalType): MalNil {
        throw new Error(`not supported`);
    }
}

export class MalBoolean {
    type: Node.Boolean = Node.Boolean;
    meta?: MalType;

    constructor(public v: boolean) {
    }

    withMeta(meta: MalType) {
        const v = new MalBoolean(this.v);
        v.meta = meta;
        return v;
    }
}

export class MalSymbol {
    static map = new Map<symbol, MalSymbol>();

    static get(name: string): MalSymbol {
        const sym = Symbol.for(name);
        let token = this.map.get(sym);
        if (token) {
            return token;
        }
        token = new MalSymbol(name);
        this.map.set(sym, token);
        return token;
    }

    type: Node.Symbol = Node.Symbol;
    meta?: MalType;

    private constructor(public v: string) {
    }

    withMeta(_meta: MalType): MalSymbol {
        throw new Error(`not supported`);
    }
}

export class MalKeyword {
    static map = new Map<symbol, MalKeyword>();

    static get(name: string): MalKeyword {
        const sym = Symbol.for(name);
        let token = this.map.get(sym);
        if (token) {
            return token;
        }
        token = new MalKeyword(name);
        this.map.set(sym, token);
        return token;
    }

    type: Node.Keyword = Node.Keyword;
    meta?: MalType;

    private constructor(public v: string) {
    }

    withMeta(_meta: MalType): MalKeyword {
        throw new Error(`not supported`);
    }
}

export class MalVector {
    type: Node.Vector = Node.Vector;
    meta?: MalType;

    constructor(public list: MalType[]) {
    }

    withMeta(meta: MalType) {
        const v = new MalVector(this.list);
        v.meta = meta;
        return v;
    }
}

export class MalHashMap {
    type: Node.HashMap = Node.HashMap;
    stringMap: { [key: string]: MalType } = {};
    keywordMap = new Map<MalType, MalType>();
    meta?: MalType;

    constructor(list: MalType[]) {
        while (list.length !== 0) {
            const key = list.shift()!;
            const value = list.shift();
            if (value == null) {
                throw new Error("unexpected hash length");
            }
            if (key.type === Node.Keyword) {
                this.keywordMap.set(key, value);
            } else if (key.type === Node.String) {
                this.stringMap[key.v] = value;
            } else {
                throw new Error(`unexpected key symbol: ${key.type}, expected: keyword or string`);
            }
        }
    }

    withMeta(meta: MalType) {
        const v = this.assoc([]);
        v.meta = meta;
        return v;
    }

    has(key: MalKeyword | MalString) {
        if (key.type === Node.Keyword) {
            return !!this.keywordMap.get(key);
        }
        return !!this.stringMap[key.v];
    }

    get(key: MalKeyword | MalString) {
        if (key.type === Node.Keyword) {
            return this.keywordMap.get(key) || MalNil.instance;
        }
        return this.stringMap[key.v] || MalNil.instance;
    }

    entries(): [MalType, MalType][] {
        const list: [MalType, MalType][] = [];

        this.keywordMap.forEach((v, k) => {
            list.push([k, v]);
        });
        Object.keys(this.stringMap).forEach(v => list.push([new MalString(v), this.stringMap[v]]));

        return list;
    }

    keys(): MalType[] {
        const list: MalType[] = [];
        this.keywordMap.forEach((_v, k) => {
            list.push(k);
        });
        Object.keys(this.stringMap).forEach(v => list.push(new MalString(v)));
        return list;
    }

    vals(): MalType[] {
        const list: MalType[] = [];
        this.keywordMap.forEach(v => {
            list.push(v);
        });
        Object.keys(this.stringMap).forEach(v => list.push(this.stringMap[v]));
        return list;
    }

    assoc(args: MalType[]): MalHashMap {
        const list: MalType[] = [];
        this.keywordMap.forEach((value, key) => {
            list.push(key);
            list.push(value);
        });
        Object.keys(this.stringMap).forEach(keyStr => {
            list.push(new MalString(keyStr));
            list.push(this.stringMap[keyStr]);
        });

        return new MalHashMap(list.concat(args));
    }

    dissoc(args: MalType[]): MalHashMap {
        const newHashMap = this.assoc([]);

        args.forEach(arg => {
            if (arg.type === Node.String) {
                delete newHashMap.stringMap[arg.v];
            } else if (arg.type === Node.Keyword) {
                newHashMap.keywordMap.delete(arg);
            } else {
                throw new Error(`unexpected symbol: ${arg.type}, expected: keyword or string`);
            }
        });
        return newHashMap;
    }
}

export class MalFunction {
    static fromLisp(evalMal: (ast: MalType, env: Env) => MalType, env: Env, params: MalSymbol[], bodyAst: MalType): MalFunction {
        const f = new MalFunction();
        f.func = (...args) => evalMal(bodyAst, new Env(env, params, checkUndefined(args)));
        f.env = env;
        f.params = params;
        f.ast = bodyAst;
        f.isMacro = false;

        return f;

        function checkUndefined(args: (MalType | undefined)[]): MalType[] {
            return args.map(arg => {
                if (!arg) {
                    throw new Error(`undefined argument`);
                }
                return arg;
            });
        }
    }

    static fromBootstrap(func: MalF): MalFunction {
        const f = new MalFunction();
        f.func = func;
        f.isMacro = false;

        return f;
    }

    type: Node.Function = Node.Function;
    func: MalF;
    ast: MalType;
    env: Env;
    params: MalSymbol[];
    isMacro: boolean;
    meta?: MalType;

    private constructor() { }

    toMacro() {
        const f = new MalFunction();
        f.func = this.func;
        f.ast = this.ast;
        f.env = this.env;
        f.params = this.params;
        f.isMacro = true;
        f.meta = this.meta;

        return f;
    }

    withMeta(meta: MalType) {
        const f = new MalFunction();
        f.func = this.func;
        f.ast = this.ast;
        f.env = this.env;
        f.params = this.params;
        f.isMacro = this.isMacro;
        f.meta = meta;

        return f;
    }

    newEnv(args: MalType[]) {
        return new Env(this.env, this.params, args);
    }
}


export class MalAtom {
    type: Node.Atom = Node.Atom;
    meta?: MalType;

    constructor(public v: MalType) {
    }

    withMeta(meta: MalType) {
        const v = new MalAtom(this.v);
        v.meta = meta;
        return v;
    }
}