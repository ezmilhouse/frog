frog.js
====
Web application framework based on `node.js` and `require.js`.

#   Framework

##  core 
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

```
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

