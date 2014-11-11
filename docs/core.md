<a name="Basics"></a>
# Basics
Documentation of basic functionality, concepts and conventions that are true across all parts of Frog.

- [cb()](#Core.cb)

<a name="Basics.cb"></a>
## cb(err, body, status[,code])
Every callback in Frog comes with the same set of arguments.

**err**  _Boolean_  _(or null)_  
Is set to `true` in error case, is set to `false` (or `null`) in error case.

**body**  _Mixed_  
Holds returning data.

**status** _Integer_  
Holds a http status code equivalent.

**code** _String_ `optional`  
Holds a http status code description equivalent (spaces replaced with dashes) or custom description, capitalized.

### Example
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

### Example: Handling Response (based on status)

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

### Example: Handling Response (based on code)
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