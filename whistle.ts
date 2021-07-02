import { promise_input } from "./ts_readlines";
import { rep } from './repl/rep';
import { Env } from "./env/env";
import { ns } from './repl/funcs/core';

var env = new Env();
ns.forEach((value, key) => {
    env.set(key, value);
});

(async() => {

    while (true)
    {
        let line: string = await promise_input();

        if (line == null) break;
        if (line === "") continue;

        try {
            var repResult = await rep(line, env);
            console.log(repResult);
        } catch(ex: any)    
        {
            console.error(ex.message);
        }
    }
})();
