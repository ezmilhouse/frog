Frog-CLI
====

Frog
====
Web application framework based on `node.js` and `require.js`.

- Core
  - [core.app](#)
  - [core.Base](#)
  - [core.Collection](#)
  - [core.date]()
  - [core.Events](#)
  - [core.Events.Singleton](#)
  - [core.Flow](#core.flow)
  - [core.Handler.Form](#)
  - [core.Handler.Object](#)
  - [core.I18n](#)
  - [core.Inherit](#)
  - [core.log](#core.log)
  - [core.Model](#)
  - [core.singleton](#)
  - [core.util](#)
  - [core.validations](#)
  - [core.xhr](#)
- Client
  - [client.Api](#)
  - [client.Component](#)
  - [client.Facebook](#)
  - [client.require](#)
  - [client.Route](#)
  - [client.Router](#)
  - [client.View](#)
- REST
  - [rest.Service](#rest.Service)
- Server
  - [server.Email](#)
  - [server.HTTP](#)
  - [server.REST](#)
  - [server.Resource](#)
  - [server.Schema](#)

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

<a name="core.flow"></a>
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

- [end](#core.flow.end)
- [par](#core.flow.par)
- [parEach](#core.flow.parEach)
- [seq](seq)
- [seqEach](#core.flow.seqEach)

<a name="core.flow.end"></a>
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

<a name="core.flow.par"></a>
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

<a name="core.flow.parEach"></a>
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

<a name="core.flow.seq"></a>
##### .seq([cb])
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

<a name="core.flow.seqEach"></a>
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
### core.Inheri

<a name="core.log"></a>
### core.log
Lightweight wrapper for `console.log()` to avoid all kinds of FF problems if `console.log()` is somewhere left in production code.
Contains `.log()` and `.trc()` methods, both are attached to `window` object as well, therefore available everywhere.

### Methods

- [log](#core.log.log)
- [trc](#core.log.trc)

<a name="core.log.log"></a>
#### log(mixed0[,mixedn])
> ***mixed0*** _*_  
> Whatever you want to log out.  
> ***mixedn*** _*_  
> Unlimited number of arguments, whatever you want to log out.

Wraps arround `console.log()` if available, logs into console.

```js
// show log in console
frog.log('a', 'b', 'c');

// call on window object
log('a', 'b', 'c');

```

<a name="core.log.trc"></a>
#### trc(mixed0[,mixedn])
> ***mixed0*** _*_  
> Whatever you want to trace out.  
> ***mixedn*** _*_  
> Unlimited number of arguments, whatever you want to trace out.

Wraps arround `console.trace()` if available. Logs including trace into console.

```js
// show trace in console
frog.trc();

// call on window object
trc();
```

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

##  REST

<a name="rest.Service"></a>
### rest.Service
A REST `Service` represents a piece of logic that can be accessed via URL (or via internal event emission for cross reference purposes). You can bind whatever method to your `Service` instance or use one of five native `CRUD` methods.

- [Example](#rest.Service.Example)
- [Example: CRUD](#rest.Service.ExampleCRUD)

- [Options](#rest.Service.Options)
- [Function](#rest.Service.Function)
- [Callback](#rest.Service.Callback)
- [Response Object](#rest.Service.ResponseObject)
- [Access by URL](#rest.Service.AccessByUrl)
- [Access by Event Emission](#rest.Service.AccessByEventEmission)

<a name="rest.Service.Example"></a>
### Example: 

```js

// service logic
var fn = function(req, cb) {

	// fetch users
	var users = [
		'Peter', 
		'Bob', 
		'Andrew'
	];
	
	// return all users
	cb(null, users, 200, 'OK');

};


// service (as REST resource)
new frog.Service({
	fn        : fn,
	method    : 'GET',
	namespace : 'users',
	route     : '/users'
});

```

Setting up the `Service` instance above results in a route `http://localhost:[port]/users` being created that is bound to the `fn` method that holds the service logic. Calling this URL via http `GET` will trigger `fn` and return a standard response object based on given parameters of the `cb` call.

```js

// service response object
{
	code    : 'OK'
	count   : 3,
	data    : [
		'Peter', 
		'Bob', 
		'Andrew'
	],
	debug   : false,
	error   : false,
	status  : 200,
	success : true
}

```

Learn more about the response object [below](#rest.Service.ResponseObject).

<a name="rest.Service.ExampleCRUD"></a>
### Example: CRUD
You can use native CRUD services to implement full REST resources. Just add a `Schema` and create `Service` instances for all available methods:

- INDEX
- CREATE
- RETRIEVE
- UPDATE
- DELETE

```js


// SCHEMA

var schema = new frog.Schema({
	collection : 'users',
	document   : {
	    name : {type : String, index : true, default : 'John Doe'},
	    city : {type : String, index : true, default : 'New York City'}
	},
	options    : {
	    strict : false
	}
});

// SERVICES

// index
new frog.Service({
	fn        : 'index',
	method    : 'GET',
	namespace : 'users',
	route     : '/users',
	schema    : schema
});

// create
new frog.Service({
	fn        : 'create',
	method    : 'POST',
	namespace : 'users',
	route     : '/users',
	schema    : schema
});

// retrieve
new frog.Service({
	fn        : 'retrieve',
	method    : 'GET',
	namespace : 'users',
	route     : '/users/:id',
	schema    : schema
});

// update
new frog.Service({
	fn        : 'update',
	method    : 'PUT',
	namespace : 'users',
	route     : '/users/:id',
	schema    : schema
});

// delete
new frog.Service({
	fn        : 'delete',
	method    : 'DELETE',
	namespace : 'users',
	route     : '/users/:id',
	schema    : schema
});


```

<a name="rest.Service.Options"></a>
##### new frog.Service([options])
Create a `Service` instance using the following `options`:
> ***fn*** _Function_ `required`
> Function or string representing one of the five CRUD verbs:  
> index  
> create  
> retrieve  
> update  
> delete

> ***method*** _String_ `optional`  
> Http method to make this service accessable from, methods to CRUD services are set automatically (GET, POST, PUT, DELETE), can be overwritten here, defaults to GET.

> `required` ***namespace*** _String_  
> The namespace set here allows to access service internally by event emission.

> `optional` ***route*** _String_  
> Follows the restify routing mechanics, excepts regex. Service not available via URL if not set.

> `optional` ***schema*** _Object_  
> Mongoose schema (for MongoDB). Required only in case of native CRUD methods.

<a name="rest.Service.Function"></a>
### Function
The function you pass to the `Service` constructor as `fn` value will have two arguments
> ***req*** _obj_  
> A request object holding keys: `params`, `query`, `body`.  
> ***cb*** _*_  
> A callback to return results when done.

```js

// service logic
var fn = function(req, cb) {
	
	// extract user id from route /users/:id/education
	// route parameters are saved on params object
	var userId = req.params.id;
	
	// some random logic
	var userYearsInSchools = 10;
	var userYearsInCollege = 4;
	
	// some random result
	var userYearsInEducation = userYearsInSchools + userYearsInCollege;

	// some random async method (or event call)
	setTimeout(function() {
	
		// invoke callback when everything is done
		cb(null, {
			userId : userId,
			userYearsInEducation : userYearsInEducation 
		}, 200, 'OK');
	
	}, 1000);

}

// service
new frog.Service({
	fn        : fn,
	method    : 'GET',
	namespace : 'users',
	route     : '/users/:id/education'
});


```





<a name="rest.Service.Callback"></a>
### Callback

<a name="rest.Service.ResponseObject"></a>
### Response Object

<a name="rest.Service.AccessByUrl"></a>
### Access By URL

<a name="rest.Service.AccessByEventEmission"></a>
### Access by Event Emission

```js





```

Access service via `http://localhost:[PORT]/users`, receive response object

```js



```

### Options

#### [fun|str] fn
Set string to use native CRUD service (`index`, `create`, `retrieve` `update`, `delete`) or function. When using function, function comes with four standard arguments `err` `body`, `status`, `code`:

```js

// CRUD service
new frog.Service({
	fn : 'create'
	// ...
});

// custom service
new frog.Service({
	fn : function(req, cb) {
	
		// do stuff
		// invoke callback
		cb(null, true, 200, 'OK');
	
	}
	// ...
});


```


#### [str] method
#### [str] namespace
#### [str] route
#### [obj] schema




Support for `CRUD` services is already implemented, the follwoing `CRUD` services are supported:

```
HTTP Method   | URI            | CRUD Verb    
--------------|----------------|--------------
GET           | /users         | index
POST          | /users         | create
GET           | /users/:id     | retrieve
PUT           | /users/:id     | update
DELETE        | /users/:id     | delete
--------------|----------------|--------------
```

### URL Parameters
Use the following URL parameters to handle, specify request and response object.

#### [bol] debug
Turns on debug mode, results in verbose response object.

#### [num] limit
Sets the maximum number of objects (array keys) to be returned.

#### [num] offset
Sets the number of number of objects to be skipped.

#### [num] page
Used to calculate offset based on given limit.  

#### [str] payload
Name of pre-set payload, if set response object is reduced to given payload keys.

### [obj] sort
Accepts mongo sort object.

### Example: CRUD (`index`, `create`, `retrieve`, `update`, `delete`)
To setup an REST API resource that supports all available CRUD verbs just setup `Schema` and `Services` according to the spec.

```js

// SCHEMA

var schema = new frog.Schema({
	collection : 'users',
	document   : {
	    name : {type : String, index : true, default : 'Mr Frog'},
	    city : {type : String, index : true, default : 'Berlin'}
	},
	options    : {
	    strict : false
	}
});

// SERVICES

// index
new frog.Service({
	fn        : 'index',
	method    : 'GET',
	namespace : 'users',
	route     : '/users',
	schema    : schema
});

// create
new frog.Service({
	fn        : 'create',
	method    : 'POST',
	namespace : 'users',
	route     : '/users',
	schema    : schema
});

// retrieve
new frog.Service({
	fn        : 'retrieve',
	method    : 'GET',
	namespace : 'users',
	route     : '/users/:id',
	schema    : schema
});

// update
new frog.Service({
	fn        : 'update',
	method    : 'PUT',
	namespace : 'users',
	route     : '/users/:id',
	schema    : schema
});

// delete
new frog.Service({
	fn        : 'delete',
	method    : 'DELETE',
	namespace : 'users',
	route     : '/users/:id',
	schema    : schema
});
```

Access your services via `HTTP` requests:

```
GET    http://localhost:[PORT]/users
POST   http://localhost:[PORT]/users
GET    http://localhost:[PORT]/users/1234567890
PUT    http://localhost:[PORT]/users/1234567890
DELETE http://localhost:[PORT]/users/1234567890

```
 
Example: Function 
 
```js

var fn = function(a, b, c) {

	// some logic
	var c = a + b;
	
	// invoke callback when ready
	// callback comes with 4 parameters
	// cb(err)
	cb(null, {
		a : a,
		b : b,
		c : c
	}, 200);

};

var service = new frog.Service({
	fn        : fn,
	method    : 'POST',
	namespace : 'foo:bar',
	route     : '/foo/bar' 
});

```

Now you can call service via url:

```
POST /foo/bar
```

or internally using the event emitter:

```
app.emit('foo:bar');
```

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

