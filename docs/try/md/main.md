#  JavaScript SDK

| Class            | Complete       | Comments   | Docs       | Tests      |
|------------------|----------------|------------|------------|------------|
| API              | ok             |            |            |            |
| Base             | ok             | ok         |            | ok         |
| Collection       |                |            |            |            |
| Component        |                |            |            |            |
| Events           | ok             |            |            |            |
| Events.Singleton | ok             |            |            |            |
| flow             | DEPRECATED     |            |            |            |
| Flow             | ok             | ok         | [ok](#documentation-frog-flow)         | ok         |
| Inherit          | ok             |            |            |            |
| log              | ok             | ok         | [ok](#documentation-frog-log)         |            |
| Model            |                |            |            |            |
| require          | ok             |            |            |            |
| Route            | ok             |            |            |            |
| Router           | ok             |            |            |            |
| util             | ok             | ok         |            |            |
| Video            | DEPRECATED     |            |            |            |
| View             | ok             |            |            |            |
| xhr              | ok             |            |            | &nbsp;     |

# Quickstart
To use the SDK (as part of the preview application) on your local machine just 
follow the steps:

*  checkout repo
*  go to repo directory  
*  run init script  
*  run start script  

Open browser, go to [http://localhost:2300](http://localhost:2300).

```
$ git clone git@github.com:fanmiles/frog-pre.git [PATH/TO/WORKING/COPY]
$ cd [PATH/TO/WORKING/COPY]
$ make init
$ make start
```
#  Builds
## Setup
If you build the first time on your local machine you need some dependencies to be installed, use the following steps:
```
$ make build-init
```
## Build Version
To build a new version of the SDK just follow the steps. Builder expects to be run from develop branch, it will build on the `develop` branch, commit and push everything `origin/develop`. After that `develop` branch will be merged with `master` branch and pushed to `origin master`. In a last step local branch is switched back to `develop`.
```
$ make build
```
#  Tests
## Setup
Unit tests are handled by `mocha`. Therefore `mocha` (and it's dependencies need to be installed globally).
Running `make tests-init` will install `mocha` in sudo mode, provide password if asked.
```js
$ make tests-init
```
## Run Tests
To run all tests in `/tests` folder use `make tests-unit`.
```js
$ make tests-unit
```
#    Reference
## frog.API
### .get(uri[,id][,query][,fn][,noProgram])
Allows to invoke GET requests to API (in-/outside the program context). Supports CRUD `index` (if id is not set) and CRUD `retrieve` (if id is set).  
#### Parameters
 
_required - str_ `uri`  
Relative path to API endpoint. 
```js
'/users'
```

_optional - str_ `id`  
Set specific id (retrieve), defaults to `null` (index).
```js
'1234567890'
```

_optional - obj_ `query`  
Set querystring options, defaults to `null`.
```js
// index
// query options
{
    limit  : 100,
    locale : 'de_DE',
    offset : 0,
    page   : 1
}

// retrieve
// query options
{
    locale : 'de_DE'
}
```

_optional - fun_ `fn`  
Set callback, callback receives parameters `err` and `response`.
```js
function(err, response) {
    // handle response;
}
```

_optional - bol_ `noProgram`  
If not set (or set to `false`) uri parameter will be prepended by program context, so paths end up as `/program/1/users`. If set to `true`, program context is won't be set, leaving uri as it is, defaults to `false`.
```js
true
```
#### Example  
`CRUD Index` - _program context_    
Request list of entities in program context.
```js
var api = new frog.API();

// results in request to:
// https://api.fanmiles.com/api/program/1/me/transactions
api.get('/me/transactions', {
    offset : 0,
    limit  : 50
}, function(err, res) {

    // handle error
    if (err) {
        return log(err, res.body);
    }
    
    // handle success
    log(res.body);

});
```  
`CRUD Retrieve` - _program context_    
Request single entity in program context.
```js
// results in request to:
// https://api.fanmiles.com/api/program/1/me/transactions/1234567890
api.get('/me/transactions', '1234567890', function(err, res) {

    // handle error
    if (err) {
        return log(err, res.body);
    }
    
    // handle success
    log(res.body);

});
```
`CRUD Index` - _no program context_    
Request list of entities in program context.
```js
// results in request to:
// https://api.fanmiles.com/api/transactions
api.get('/transactions', {
    offset : 0,
    limit  : 50
}, function(err, res) {

    // handle error
    if (err) {
        return log(err, res.body);
    }
    
    // handle success
    log(res.body);

}, true);
```
`CRUD Retrieve` - _no program context_    
Request single entity in program context.
```js
// results in request to:
// https://api.fanmiles.com/api/transactions/1234567890
api.get('/transactions', '1234567890', function(err, res) {

    // handle error
    if (err) {
        return log(err, res.body);
    }
    
    // handle success
    log(res.body);

}, true);
```
### .post(uri, body[,query][,fn][,noProgram])
### .put(uri, body, id[,query][,fn][,noProgram])
### .del(uri, id[,query][,fn][,noProgram])
### .env()
### .user()
##  frog.API.cookie
###  .del(key)
Helper method that allows to delete a specific cookie based on incoming key.
#### Parameters
_required - str_ `key`  
Set key of cookie to delete.
```js
'JSESSIONID'
```
#### Example
&nbsp;
```js
var api = new frog.API();

// delete cookie
api.cookie.del('JSESSIONID');
```
### .get(key)
Helper method that allows to get a specific cookie based on incoming key.
#### Parameters
_required - str_ `key`  
Set key of cookie to retrieve.
```js
'JSESSIONID'
```
#### Example
&nbsp;
```js
var api = new frog.API();

// get cookie contents
var res = api.cookie.get('JSESSIONID');
```
### .set(key, value[,days])
Helper method that allows to set a specific cookie based on incoming key/value and optional expiration in days.
#### Parameters
_required - str_ `key`  
Set key of cookie to be created.
```js
'JSESSIONID'
```
_required - str_ `value`  
Set cookie value.
```js
'1234-5678-9012-3456-7890'
```

_optional - int_ `days`  
Set cookie expiration date, in days from now.
```js
10
```
#### Example
&nbsp;
```js
var api = new frog.API();

// set cookie contents
api.cookie.set('JSESSIONID', '1234-5678-9012-3456-7890', 10);
```
##  frog.Collection
_not yet here_
##  frog.Component
_not yet here_
##  frog.Events
_not yet here_
##  frog.Flow
Allows you to control the execution order of multiple asynchronous function calls in a stack of functions.  

This flow stack can handle `sequential` and `parallel` execution blocks. To add functions to the flow stack that are going to be invoked in a sequential way, you can use `.seq()`, for parallel execution use the `.par()` method to add to the stack.  

It's also possible to add batches (arrays) of functions to be invoked sequentially or in parallel, use `.seqEach()` and `.parEach()` to add batches.  

The execution of a flow stack is triggered by the `.end()` method.  

To control data within functions in the flow stack, you can use a simple key/value store, use `this.set()` and `this.get()` to access the data (or exchange data between functions).
#### Example
Functions added by `.par()` method will execute in random order (you can NOT rely on order execution at all), the second function added with `.seq()` will always execute after both parallel blocks are executed.  

The `.get()` and `.set()` methods are used to set/get data within callbacks, please keep in mind that both methods live in the `this` context of the flow callback. If used within nested callbacks you have to preserve the flow callback's scope first, for example with `var self = this`.  

Execution of the flow stack is triggered by the `.end()` method, it can invoke its own callback, when all execution is done, this callback still executes in flow's scope, therefore you can access flow data using `.get()`.
```js
frog.Flow
    .seq(function(cb) {
        // preserve callback scope
        var self = this;
        // async function
        setTimeout(function() {
            // sequential, executed first
            log('a');
            // save data
            self.set('results', 'a');
            // done, next plz
            cb();
        }, 500);
    })
    .par(function(cb) {
        // preserve callback scope
        var self = this;
        // async function
        setTimeout(function() {
            // parallel, executed second or third
            log('b');
            // save data
            self.set('results', self.get('results') + 'b');
            // done, next plz
            cb();
        }, 500);
    })
    .par(function(cb) {
        // preserve callback scope
        var self = this;
        // async function
        setTimeout(function() {
            // parallel, executed second or third
            log('c');
            // save data
            self.set('results', self.get('results') + 'c');
            // done, next plz
            cb();
        }, 500);
    })
    .seq(function(cb) {
        // preserve callback scope
        var self = this;
        // async function
        setTimeout(function() {
            // sequential, executed fourth
            log('d');
            // save data
            self.set('results', self.get('results') + 'd');
            // done, next plz
            cb();
        }, 500);
    })
    .end(function(cb) {
        // done, flow stack executed completely
        log('done');
        // show results: 'abcd'
        log('results', this.get('results'));
    });
```
### .seq(fn)
Allows to add a single function that should be invoked `sequentially` within flow stack. Function receives callback function `cb` as parameter, when invoked next function in flow stack will be executed.
#### Parameters
_optional - fun_ `fn`  
Set callback to be added to flow stack. 
```js
function(cb) {
    // done
    cb();
}
```
#### Example
&nbsp;
```js
frog.Flow
    .seq(function(cb) {
        // sequential, executed first
        log('a');
        // done, next plz
        cb();
    })
    .seq(function(cb) {
        // sequential, executed second
        log('b');   
        // done, next plz 
        cb();    
    })
    .end();
```
### .par(fn)
Allows to add a single function that should be invoked in `parallel` within flow stack. Function receives callback function `cb` as parameter, when invoked next function in flow stack will be executed.
#### Parameters
_optional - fun_ `fn`  
Set callback to be added to flow stack. 
```js
function(cb) {
    // done
    cb();
}
```
#### Example
&nbsp;
```js
frog.Flow
    .par(function(cb) {
        // parallel, might be executed first or second
        log('a');
        // done, next plz
        cb();
    })
    .par(function(cb) {
        // parallel, might be executed first or second
        log('b');    
        // done, next plz
        cb();    
    })
    .end();
```
### .end([fn])
Ends (caps) flow stack and triggers its execution. Allows optional `fn` as final callback, it will be invoked after flow stack is executed completely. Flows without `.end()` cap will not execute at all.
#### Parameters
_optional - fun_ `fn`  
Set final callback, to be invoked when flow stack executed completely. 
```js
function() {
    // handle end
}
```
#### Example
&nbsp;
```js
frog.Flow
    .seq(function(cb) {
        cb();
    })
    .seq(function(cb) {
        cb();    
    })
    .end(function() {
        // done, flow stack executed completely
        log('done');
    });
```
### .seqEach(arr)
Allows to add an array of functions that should be invoked `sequentially` within flow stack. Functions in array receive callback function `cb` as parameter, when invoked next function in flow stack will be executed.
#### Parameters
_optional - arr_ `arr`  
Set array of callbacks to be added to flow stack. 
```js
[
    function(cb) {
        // done
        cb();
    },
    function(cb) {
        // done
        cb();
    }
]
```
#### Example 
&nbsp;
```js
// prepare array of callbacks
var arr = [
    function(cb) {
        // sequential, executed first
        log('a');
        // done, next plz 
        cb();
    },
    function(cb) {
        // sequential, executed second
        log('b');   
        // done, next plz 
        cb(); 
    }
];

// execute flow using prepared array 
frog.Flow
    .seqEach(arr)
    .end();
```
### .parEach(arr)
Allows to add an array of functions that should be invoked in `parallel` within flow stack. Functions in array receive callback function `cb` as parameter, when invoked next function in flow stack will be executed.
#### Parameters
_optional - arr_ `arr`  
Set array of callbacks to be added to flow stack. 
```js
[
    function(cb) {
        // done
        cb();
    },
    function(cb) {
        // done
        cb();
    }
]
```
#### Example
&nbsp;
```js
// prepare array of callbacks
var arr = [
    function(cb) {
        // parallel, executed first or second
        log('a');
        // done, next plz 
        cb();
    },
    function(cb) {
        // parallel, executed first or second
        log('b');   
        // done, next plz 
        cb(); 
    }
];

// execute flow using prepared array 
frog.Flow
    .parEach(arr)
    .end();
```
##  frog.log
Lightweight wrapper for `console.log()` to avoid all kinds of FF problems if `console.log()` is somewhere left in production code.  

Contains `.log()` and `.logTrace()` methods, both are attached to `window` object as well, therefore available everywhere.

### .log(mixed0[,mixedn])
Wraps arround `console.log()` if available, logs into console.
```js
// show log out in console
frog.log('a', 'b', 'c');

// call on windows object
log('a', 'b', 'c');

```
### .logTrace()
Wraps arround `console.trace()` if available. logs call trace into console.
```js
// show call trace in console
frog.logTrace();

// call on windows object
logTrace();
```
##  frog.Model
_not yet here_
##  frog.require
_not yet here_
##  frog.Router
_not yet here_
##  frog.util
_not yet here_
##  frog.View
_not yet here_
##  frog.xhr
_not yet here_
