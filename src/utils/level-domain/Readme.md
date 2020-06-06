### Argument that function may wait for is imagined by...
 - rigorous expectation - langauge builtin typecheck (minimally checks number of arguments for js)
 - strict prediction - infer with written syntaxes. For example, if statement, props access
 - loose assumption - accumulated data based linear regressive assumptions

        created
        codeString
        /   |    \
       /    |     \
      /    ast     \
     /    /   \     \
Executable ------ Storable
evaluated         stored
                              middle
states \[ creation, evaluated, stored,    verbose ]
         methods   execable   tagged     ast

    // module names
    this.modules = [];
    // argument names
    this.parameters = [];
    // context variable names (global constants, remaining ones after substracting parameters)
    this.context = [];
    // scope variable names (prototype functions, usually within 'this' keyword)
    this.binding = [];

    // queue for data that are waiting to be a domain.
    creating: [],
    // domains that contain executable js function as discriminator
    evaluated: {},
    // tags used for strict prediction (./readme.md)
    analyzed: index(sublevel(db, 'analyzed'), { primaryIndex: null }),
    // raw code strings before parse
    original: index(sublevel(db, 'original'), { primaryIndex: null }),
    // syntax tree stored in graph model.
    astGraph: levelgraph(sublevel(db, 'astGraph')),