## A Lisp for Web Scraping - Because, Why Not?
#### Version: ??
Wsil (*Web Scraping in Lisp*) is a MAL implementation designed around web scraping.This language is derrived from [this](https://github.com/kanaka/mal/blob/master/impls/ts/step4_if_fn_do.ts), 
and some code has been retained.


**WARNING**: This project is not remotely close to production ready. Expect the unexpected,
and feel free to contribute bug-fixes.

### A Lisp for Web Scraping
Web scraping should be simple. It's not. Does this help matters? No, not even remotely. But it keeps you from having to learn a new library, instead you can learn an entire new language. Much easier. It even has a creative name _WSIL_ Web Scraping in Lisp! Amazing, right?

### Why TypeScript

TypeScript may appear to be an odd, or even bad, choice for implementing a programming language. Why implemented a language in a language that's implemented in arguably the most obnixous language on the market?

The objective here is not to create a blazingly fast new programming language to replace an existing one. The objective isn't even to write a _good_ programming language. The objective here is to make sure I never have to fight with Clojure's web scraping utilities again. Yes, _I wrote an entire language rather than reconfigure my IDE to manage this for me_. You're welcome.

### Examples


```clojure
(def! pages ["http://example.com" "http://news.ycombinator.com"])
(def! browser (chrome-browser :window))
(def! openPages (fn* [page] (set-page (new-page browser) page)))
(apply openPages pages)
```

Execute scripts from the REPL:
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
