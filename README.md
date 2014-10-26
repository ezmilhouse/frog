Frog-CLI
====

Frog
====
Web application framework based on `node.js` and `require.js`.

#   Framework

##  Core 

- [core.app](#)
- [core.Base](#)
- [core.Collection](#)
- [core.date]()
- [core.Events](#)
- [core.Events.Singleton](#)
- [core.Flow](#)
- [core.Handler.Form](#)
- [core.Handler.Object](#)
- [core.I18n](#)
- [core.Inherit](#)
- [core.log](#)
- [core.Model](#)
- [core.singleton](#)
- [core.util](#)
- [core.validations](#)
- [core.xhr](#)

### core.app
> Singleton  
> DEPRECATED
> Might end up as `App.Singleton`, might as well be merged with `core.singleton`

### core.Base
### core.Collection
### core.date
> Functions

### core.Events
### core.Events.Singleton
> Singleton  
> DEPRECATED
> Might as well be merged with `core.singleton`

### core.Flow
***
Allows you to control the execution order of multiple asynchronous function calls in a stack of functions, sequentially, as well as in parallel.

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

#### Methods

- [end](end)
- [par](par)
- [parEach](parEach)
- [seq](seq)
- [seqEach](seqEach)

##### .end([cb])
> ***cb*** _Function_  
> Callback to be invoked when flow stack has executed completely.

Ends (caps) flow stack and triggers its execution. Allows optional `cb` as final callback, it will be invoked after flow stack has executed completely. Flows without `.end()` cap will not execute at all.

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

##### .par([cb])
> ***cb*** _Function_  
> Callback to be invoked when function has executed.

Allows to add a single function that should be executed in `parallel` within flow stack. Function receives callback function `cb` as parameter, when invoked next function in flow stack will be executed.

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

##### .parEach(arr)
> ***arr*** _Array_  
> Array of functions to be executed in parallel.

Allows to add an array of functions that should be executed in `parallel` within flow stack. Functions in array receive callback function `cb` as parameter, when invoked next function in flow stack will be executed.

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

##### .seq([fn])
> ***cb*** _Function_  
> Callback to be invoked when function has executed.

Allows to add a single function that should be executed `sequentially` within flow stack. Function receives callback function `cb` as parameter, when invoked next function in flow stack will be executed.

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

##### .seqEach(arr)
> ***arr*** _Array_  
> Array of functions to be executed sequentially.

Allows to add an array of functions that should be executed `sequentially` within flow stack. Functions in array receive callback function `cb` as parameter, when invoked next function in flow stack will be executed.

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

### core.Handler.Form
> DEPRECATED  
> Might end ap as `client.Form`

### core.Handler.Object
> DEPRECATED  
> Might end ap as `core.Object`

### core.I18n
### core.Inherit
### core.log
> Functions  

### core.Model
### core.singleton
> DEPRECATED  
> Might end up as `core.cache`

### core.util
> Functions

### core.validations
> Functions  

### core.xhr
> Functions  

##  Client
### client.Api
### client.Component
### client.Facebook
### client.require
> Functions
> DEPRECATED
> Might end up as `load`, naming conflict with `require.js`

### client.Route
> DEPRECATED
> Should be part of `client.Router`

### client.Router
### client.View

##  Server
### Server.Email
### server.HTTP
### server.REST
### server.Resource
> DEPRECATED
> Might end up as `srever.REST.Resource`

### server.Schema
> DEPRECATED
> Might end up as `srever.REST.Schema`

