<a name="rest.Service"></a>
# frog.REST.Service
A REST `Service` represents a piece of logic that can be accessed via URL (or via internal event emission for cross reference purposes). You can bind whatever method to your `Service` instance or use one of five native `CRUD` methods.

- [Example](#rest.Service.Example)
- [Example: CRUD](#rest.Service.ExampleCRUD)

All the details here:

- [Constructor](#rest.Service.Constructor)
- [Function](#rest.Service.Function)
- [Callback](#rest.Service.Callback)
- [Response Object](#rest.Service.ResponseObject)
- [Access by URL](#rest.Service.AccessByUrl)
- [Access by Event Emission](#rest.Service.AccessByEventEmission)

<a name="rest.Service.Example"></a>
### Example: 

```
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

<a name="rest.Service.ExampleCRUD"></a>
### Example: CRUD
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

<a name="rest.Service.Constructor"></a>
### Constructor
Create a `Service` instance using the following `options`:

```
new frog.REST.Service({

	// options

});
```

**fn** _Function_  
Function or string representing one of the five CRUD verbs: index, create, retrieve, update, delete.  

**method** _String_ `optional`  
Http method to make this service accessable from, methods to CRUD services are set automatically (GET, POST, PUT, DELETE), can be overwritten here, defaults to GET.  

**namespace** _String_   
The namespace set here allows to access service internally by event emission.  

**route** _String_  `optional`  
Follows the restify routing mechanics, excepts regex. Service not available via URL if not set. 

**schema** _Object_  `optional`  
Mongoose schema (for MongoDB). Required only in case of native CRUD methods.

<a name="rest.Service.Function"></a>
### Function
### fn(req, cb)
The function you pass to the `Service` constructor as `fn` value has two arguments:

**req** _Object_  
A request object holding keys: `params`, `query`, `body`.  

**cb** _Function_  
A callback to return results when done.

#### Example

```
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
### cb([err][, body][, status][, code])
The callback function to be used inside `fn` has the [default callback footprint](#basics.Callback).

&nbsp;

<a name="rest.Service.ResponseObject"></a>
### Response Object
The response object based on parameters sent with `cb` has the [default REST footprint](#rest.Basics.ResponseObject).

&nbsp;

<a name="rest.Service.AccessByUrl"></a>
### Access By URL
If you use  custom functions to represent your application's logic, then you're free to send whatever parameter you want via URL. 
You can access these parameters via the `req` argument of `fn`. Find detailed information on the service function [here](#rest.Service.Function).

If you decide to go with one of the existing [CRUD methods](#rest.Service.ExampleCRUD), then you have a fixed set of URL parameters that you can send with every request.  





