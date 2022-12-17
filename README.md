## A Lisp for Web Scraping - Because, Why Not?
#### Version: ??
Wsil (*Web Scraping in Lisp*) is a MAL implementation designed around web scraping.This language is derrived from [this](https://github.com/kanaka/mal/blob/master/impls/ts/step4_if_fn_do.ts), 
and some code has been retained.


**WARNING**: This project is not remotely close to production ready. Expect the unexpected,
and feel free to contribute bug-fixes.

### A Lisp for Web Scraping

Web scraping should be simple. Right now, there's no good way to interact seamlessly with a browser
and a parsed DOM using an invariant syntax. Generally, you need to pick between an HTML parsing approach,
or a headless browser approach with code injection. If you want to use both, you will need to work across a
combination of different syntaxes, data structures, and design philosophies depending on which libraries you
combine to get this done.  

Wsil offers a second option. As a high level abstraction layer on top of Cheerio, Axios and Puppeteer, Wsil 
unites these libraries with a shared set of types, and an invariant syntax. In addition to providing syntax advantages, Wsil offers a collection of interoperable types which allow clean interactions between data collected
from all of the underlying libraries.

### Why TypeScript

TypeScript may appear to be an odd, or even bad, choice for implementing a programming language. The objective here 
is not to create a blazingly fast new programming language to replace an existing one. Instead, Wsil is a designed
to be an abstraction layer *on top existing web scraping tools*. TypeScript provides access to some of the most powerful
web scraping tools, while also allowing access to JavaScript without needing a forign-function interface. Since the target
user-base for this language would have experience developing in JavaScript and TypeScript anyway, this also opens up
the project to contributions and extensions from the sorts of developers who would benefit most from the language.

### Examples

A pure Wsil script:

```clojure
(def! pages ["http://example.com" "http://news.ycombinator.com"])
(def! browser (chrome-browser :window))
(def! openPages (fn* [page] (set-page (new-page browser) page)))
(apply openPages pages)
```

Execute Wsil scripts from the REPL:
```clojure
wsil>(x-file "script.lisp") ; Execute a file, inheret variable declarations
true
wsil>(exit 0) ; Close without error
```

Console scoping behaviour:

*External script* (wsil.lisp): 

```clojure
(def! x 10)
```

*Console*:
```clojure
wsil>(x-file "wsil.lisp")
10
wsil>(not= x nil)
true
wsil>(reload)
true
wsil>(not= x nil)
'x' not found
```
Define variable, then refresh environment:

```clojure
wsil>(def! x 10) ; Define a variable
10
wsil>x ; Inspect it
10
wsil>(reload) ; Refresh the env
true
wsil>x ; Inspect
'x' not found
```

### Contributers

Contributers are welcome to contribute features, bug-fixes, and other changes to the language. 
Right now the language is in desperate need of refactoring. The language rapidly out-grew the 
intial design patterns of the MAL it is derrived from, so cleaning up the project is will have to happen. 
To contribute, fork, squash your commits, and submit a pull request for review.
