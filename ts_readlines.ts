import * as rl from 'readline';

var rli = rl.createInterface({
    input: process.stdin,
    output: process.stdout
  });

export function promise_input(): Promise<string>
{
    return new Promise(resolve => {
        rli.question("whistle>", (line) => {
            resolve(line);
        });
    })
}