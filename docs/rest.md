<a name="frog"></a>
# frog

- [Basic](#frog.Basics)
  - [cb()](#frog.Basics.cb)
- [core](frog.core)
  - [log](frog.core.log)
- [REST](#frog.REST)
  - [Basics](#frog.REST.Basics)
    - [Requests](#frog.REST.Basics.Requests) 
    - [Response](#frog.REST.Basics.Response) 
  - [Middleware](#frog.REST.Middleware)
  - [Resource](#frog.REST.Resource) 
  - [Server](#frog.REST.Server)
  - [Service](#frog.REST.Service)

<a name="frog.Basics"></a>
# frog Basics
***
Documentation of basic functionality, concepts and conventions that are true across all parts of Frog.

- [cb()](#frog.Basics.cb)

<a name="frog.Basics.cb"></a>
## cb(err, body, status[,code])
Every callback in Frog comes with the same set of arguments.

- [Arguments](#frog.Basics.cb.Arguments)
- [Example](#frog.Basics.cb.Example)
- [Example: Handling Response (based on status)](#frog.Basics.cb.Example.HandlingResponseStatus)
- [Example: Handling Response (based on code)](#frog.Basics.cb.Example.HandlingResponseCode)

<a name="frog.Basics.cb.Arguments"></a>
#### Arguments

**err**  _Boolean_  _(or null)_  
Is set to `true` in error case, is set to `false` (or `null`) in error case.

**body**  _Mixed_  
Holds returning data.

**status** _Integer_  
Holds a http status code equivalent.

**code** _String_ `optional`  
Holds a http status code description equivalent (spaces replaced with dashes) or custom description, capitalized.

<a name="frog.Basics.cb.Example"></a>
#### Example
```
fn(function(err, body, status, code) {

	// error
	if (err) {
		return log('Error!');
	}	
	
	// success
	// ....

});

```

<a name="frog.Basics.cb.Example.HandlingResponseStatus"></a>
#### Example: Handling Response (based on status)

```
fn(function(err, body, status, code) {

    switch(status) {
        case 400 :
            return log('Bad Request!');
        break;
        case 401 :
            return log('Forbidden!');
        break;
        case 404 :
            return log('Not found!');
        break;
        default  : // 200
            return log('Ok!');
        break;
    }
    
});

```
<a name="frog.Basics.cb.Example.HandlingResponseCode"></a>
#### Example: Handling Response (based on code)
```
fn(function(err, body, status, code) {

    switch(code) {
		case 'BAD_REQUEST' :
			log('Bad Request!');	
		break;
		case 'FORBIDDEN' :
			log('Forbidden!');
		break;
		case 'SOME_CUSTOM_ERROR_CODE' :
			log('Some custom error code!');
		break;
		default :
			log('Ok!');
        break;
    }

});

```

<a name="frog.core"></a>
# Core
***
Core functionality and classes of Frog.

- [core.app](#frog.core.app)
- [core.Base](#frog.core.Base)
- [core.Collection](#frog.core.Collection)
- [core.date](#frog.core.date)
_to be moved_
- [core.Events](#frog.core.Events)
- [core.Events.Singleton](#frog.core.Events.Singleton)
_deprecated, should be part of singleton_
- [core.Flow](#frog.core.Flow)
- [core.Handler.Form](#frog.core.Handler.Form)
_to be renamed_
- [core.Handler.Object](#frog.core.Handler.Object)
_to be renamed_
- [core.I18n](#frog.core.I18n)
- [core.Inherit](#frog.core.Inherit)
- [core.log](#frog.core.log)
- [core.Model](#frog.core.Model)
- [core.singleton](#frog.core.singleton)
_to be renamed_
- [core.util](#frog.core.util)
- [core.validations](#frog.core.validations)
- [core.xhr](#frog.core.xhr)

<a name="frog.core.log"></a>
# log
Lightweight wrapper for `console.log()` to avoid all kinds of FF (lower versions) problems if `console.log()` is somewhere left in production code. Contains `.log()` and `.trc()` methods, both are attached to `window` object as well, therefore available everywhere.

## Methods

- [log](#frog.core.log)
- [trc](#frog.core.trc)

<a name="frog.core.log.log"></a>
## log(mixed0[,mixedn])
Wraps arround `console.log()` if available, logs into console.

#### Arguments

**mixed0** _Mixed_  
Whatever you want to log out.  

**mixedn** _Mixed_  
Unlimited number of arguments, whatever you want to log out.

#### Example

```
// log
frog.log('a', 'b', 'c');

// log (on window object)
log('a', 'b', 'c');

```

<a name="frog.core.log.trc"></a>
### trc(mixed0[,mixedn])
Wraps arround `console.trace()` if available. Logs including trace into console.

#### Arguments

**mixed0** _Mixed_  
Whatever you want to trace out.  

**mixedn** _Mixed_  
Unlimited number of arguments, whatever you want to trace out.

#### Example

```
// trace
frog.trc();

// trace (on window object)
trc();
```

<a name="frog.REST"></a>
***
# REST
Th REST classes provide all functionality to run a RESTful API, find more information on the server, different ways to create and maintain resources, services and middleware here.

- [Basics](#frog.REST.Basics)
  - [Requests](#frog.REST.Basics.Requests) 
  - [Response](#frog.REST.Basics.Response) 
- [Server](#frog.REST.Server)
- [Service](#frog.REST.Service)
- [Resource](#frog.REST.Resource)
- [Middleware](#frog.REST.Middleware) 

<a name="frog.REST.Basics"></a>
# frog.REST Basics
Basic methods, behaviours true for all classes and methods in REST module.

- [Requests](#frog.REST.Basics.Requests) 
- [Response](#frog.REST.Basics.Response) 

<a name="frog.REST.Basics.Requests"></a>
## Requests
If you use  custom functions to represent your application's logic, then you're free to send whatever parameter you want via URL. You can access these parameters via the `req` argument of `fn`. Find detailed information on the service function [here](#rest.Service.Function).

If you decide to go with one of the existing [CRUD methods](#rest.Service.ExampleCRUD), then you have a fixed set of URL parameters that you can send with every request.  

- [Parameters](#frog.REST.Basics.Requests.Parameters)
- [Example](#frog.REST.Basics.Requests.Example) 

<a name="frog.REST.Basics.Requests.Parameters"></a>
#### Parameters

**debug** _Boolean_  
Turns on debug mode, results in verbose response object.

**limit** _Numeric_ `index only`  
Sets the maximum number of objects (array keys) to be returned.

**offset** _Numeric_ `index only` 
Sets the number of number of objects to be skipped.

**page** _Numeric_ `index only`  
Used to calculate offset based on given limit. 

**payload** _String_  
Name of pre-set payload, if set response object is reduced to given payload keys.

**sort** _Object_ `index only`  
Accepts mongo sort object.

<a name="frog.REST.Basics.Requests.Example"></a>
#### Example

```
// xhr request
frog.xhr
	.get('/users')
	.query({
		debug   : true,
		limit   : 10,
		offset  : 10,
		payload : 'mobile',
		sort    : {
			created : -1
		}
	})
	.end(function(err, body, status, code) {

		// error
		if (err) {
			return;
		}

		// success
		log(body, status);

	});

```

<a name="frog.REST.Basics.Response"></a>
## Response
Every REST resource, every service responds with the same type of response object.

- [Object](#frog.REST.Basics.Response.Object)
- [Example](#frog.REST.Basics.Response.Example) 
- [Example: Requests](#frog.REST.Basics.Response.Example.Requests) 

<a name="frog.REST.Basics.Response.Object"></a>
#### Object

**code** _String_  
Descriptive code, defaults to http status code descriptions, ex. CREATED, might be set to custom code in case of errors.  

**count** _Integer_  `optional`  
Available only in list case, holds total number of items in list (response array length).

**data** _Mixed_  
Holds returned data.

**debug** _Boolean_  
Gives information about request mode, `true` when debug mode is turned on.

**error** _Boolean_  
Boolean to test against, `false` in success case.

**status** _Integer_  
Holds correct http status code.

**success** _Boolean_  
Boolean to test against, `false` in error case.

<a name="frog.REST.Basics.Response.Example"></a>
#### Example

```
// single object
{
	code    : 'OK'
	data    : {
		
		// response object
		// ...
		
	},
	debug   : false,
	error   : false,
	status  : 200,
	success : true
}

// list
{
	code    : 'OK'
	count   : 5,
	data    : [
	
		// response array
		// ...
	
	],
	debug   : false,
	error   : false,
	status  : 200,
	success : true
}

```

<a name="frog.REST.Basics.Response.Example.Requests"></a>
#### Example: Requests

```
// single object
frog.xhr
	.get('/users/12324567890')
	.end(function(err, body, status, code) {

		// error
		if (err) {
			return;
		}

		// success
		log(body);

		/*

		{
			code    : 'OK'
			data    : {
			
				// ...
			
			},
			debug   : false,
			error   : false,
			status  : 200,
			success : true
		}

		*/

	});

// list
frog.xhr
	.get('/users')
	.end(function(err, body, status, code) {

		// error
		if (err) {
			return;
		}

		// success
		log(body);

		/*

		{
			code    : 'OK'
			count   : 5,
			data    : [
			
				// ...
			
			],
			debug   : false,
			error   : false,
			status  : 200,
			success : true
		}

		*/

	});
```

<a name="frog.REST.Service"></a>
# frog.REST.Service
A REST `Service` represents a piece of logic that can be accessed via URL (or via internal event emission for cross reference purposes). You can bind whatever method to your `Service` instance or use one of five native `CRUD` methods.

- [Options](#frog.REST.Service.Options)
- [Example](#frog.REST.Service.Example)
- [Example: CRUD](#frog.REST.Service.Example.CRUD)
- [Access: URL](#frog.REST.Service.Access.URL)
- [Access: Event](#frog.REST.Service.Access.Event)
- [fn()](#frog.REST.Service.fn)
- [done()](#frog.REST.Service.done)

<a name="frog.REST.Service.Options"></a>
#### Options

**fn** _Function_  
Function or string representing one of the five CRUD verbs: index, create, retrieve, update, delete.  

**method** _String_ `optional`  
Http method to make this service accessable from, methods to CRUD services are set automatically (GET, POST, PUT, DELETE), can be overwritten here, defaults to GET.  

**namespace** _String_ `optional`  
The namespace set here allows to access service internally by event emission (falls back to `route` as namespace if not set).

**route** _String_  `optional`  
Follows the restify routing mechanics, excepts regex. Service not available via URL if not set. 

**schema** _Object_  `optional`  
Mongoose schema (for MongoDB). Required only in case of native CRUD methods.

<a name="frog.REST.Service.Example"></a>
#### Example

```
// service logic
var fn = function(params, body, query, done) {

	// fetch users
	var users = [
		'Peter', 
		'Bob', 
		'Andrew'
	];
	
	// return all users
	done(null, users, 200, 'OK');

};


// service (as REST resource)
new frog.REST.Service({
	fn        : fn,
	method    : 'GET',
	namespace : 'users',
	route     : '/users'
});

```

Setting up the `Service` instance above results in a route `http://localhost:[port]/users` being created that is bound to the `fn` method that holds the service logic. Calling this URL via http `GET` will trigger `fn` and return a standard response object based on given parameters of the `cb` call.

```
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

<a name="frog.REST.Service.Example.CRUD"></a>
#### Example: CRUD
You can use native CRUD services to implement full REST resources. Just add a `Schema` and create `Service` instances for all available methods:

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

```
// SCHEMA

var schema = new frog.REST.Schema({
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
new frog.REST.Service({
	fn        : 'index',
	method    : 'GET',
	namespace : 'users',
	route     : '/users',
	schema    : schema
});

// create
new frog.REST.Service({
	fn        : 'create',
	method    : 'POST',
	namespace : 'users',
	route     : '/users',
	schema    : schema
});

// retrieve
new frog.REST.Service({
	fn        : 'retrieve',
	method    : 'GET',
	namespace : 'users',
	route     : '/users/:id',
	schema    : schema
});

// update
new frog.REST.Service({
	fn        : 'update',
	method    : 'PUT',
	namespace : 'users',
	route     : '/users/:id',
	schema    : schema
});

// delete
new frog.REST.Service({
	fn        : 'delete',
	method    : 'DELETE',
	namespace : 'users',
	route     : '/users/:id',
	schema    : schema
});

```

<a name="frog.REST.Service.Access.URL"></a>
## Access: URL
If you set the `route` option, you can access the `Service` instance via URL.

```
// set up service
new frog.Service({
	fn        : function(params, body, query, done) { 
		// ... 
	},
	method    : 'GET',
	route     : '/foo',
});

```

Access your service by calling the url on your host, ex:

```
$ curl http://localhost:8080/foo
```

<a name="frog.REST.Service.Access.Event"></a>
## Access: Event
If you set the `namespace` option, then you cann access your `Service` instances via internal event emission. Event names are prefixed with `service:`.

<a name="frog.REST.Service.Access.Event.Options"></a>
#### Arguments

**obj** _Object_ `optional`  
Object that emulates request object, holding keys `params`, `body` and `query` (by convention).

**cb** _Function_ `optional`  
Callback that has the [default callback footprint](#basics.Callback).


<a name="frog.REST.Service.Access.Event.Example"></a>
#### Example

```
// set up service
new frog.Service({
	fn        : function(params, body, query, done) { 
		// ... 
	},
	namespace : 'foo'
});

// emit event
app.emit('service:foo', {
	
	params : {},
	body   : {},
	query  : {}

}, function(err, body, status, code) {
		
	// handle response

});

```
<a name="frog.REST.Service.fn"></a>
## fn(params, body, query, done)
The function you pass to the `Service` constructor as `fn` value has two arguments:

- [Arguments](#frog.REST.Service.fn.Arguments)
- [Example](#frog.REST.Service.fn.Example)

<a name="frog.REST.Service.fn.Arguments"></a>
#### Arguments

**params** _Object_  
Request parameters, mapped from restify `req.params` object.

**body** _Object_  
Request body, mapped from restify `req.body` object.

**query** _Object_  
Request body, mapped from restify `req.query` object.

**done** _Function_  
A callback to return results when done.

<a name="frog.REST.Service.fn.Example"></a>
#### Example

```
// service logic
var fn = function(params, body, query, done) {
	
	// extract user id from route /users/:id/education
	// route parameters are saved on params object
	var userId = params.id;
	
	// some random logic
	var userYearsInSchools = 10;
	var userYearsInCollege = 4;
	
	// some random result
	var userYearsInEducation = userYearsInSchools + userYearsInCollege;

	// some random async method (or event call)
	setTimeout(function() {
	
		// invoke callback when everything is done
		done(null, {
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

<a name="frog.REST.Service.done"></a>
## done([err][, body][, status][, code])
The callback function to be used inside `fn` has the [default callback footprint](#basics.Callback).
