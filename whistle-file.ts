import { rep } from './repl/rep';
import { Env } from "./env/env";
import { ns } from './repl/funcs/core';
import { readFileSync } from "fs";

var env = new Env();
ns.forEach((value, key) => {
    env.set(key, value);
});

const rawFile = readFileSync("test.wl", "utf-8");
const filteredFile = rawFile.split(";");
const cleanedFile = filteredFile.map(entry => entry.split("\r\n").join(""));
let counter = 1;

(async() => {
    for (var line of cleanedFile) 
    {
        counter++;
        if (line == null) break;
        if (line === "") continue;
        try {
            var repResult = await rep(line, env);
            if(counter == cleanedFile.length) {
                console.log(repResult);
            }
        } catch(ex: any)    
        {
            console.error(ex.message);
        }
    }
})();