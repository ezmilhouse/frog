<a name="Core.log"></a>
# frog.log
Lightweight wrapper for `console.log()` to avoid all kinds of FF (lower versions) problems if `console.log()` is somewhere left in production code. Contains `.log()` and `.trc()` methods, both are attached to `window` object as well, therefore available everywhere.

## Methods

- [log](#Core.log.log)
- [trc](#Core.log.trc)

<a name="Core.log.log"></a>
### log(mixed0[,mixedn])
Wraps arround `console.log()` if available, logs into console.

**mixed0** _Mixed_  
Whatever you want to log out.  

**mixedn** _Mixed_  
Unlimited number of arguments, whatever you want to log out.

### Example

```
// log
frog.log('a', 'b', 'c');

// log (on window object)
log('a', 'b', 'c');

```

<a name="Core.log.trc"></a>
### trc(mixed0[,mixedn])
Wraps arround `console.trace()` if available. Logs including trace into console.

**mixed0** _Mixed_  
Whatever you want to trace out.  

**mixedn** _Mixed_  
Unlimited number of arguments, whatever you want to trace out.


```
// trace
frog.trc();

// trace (on window object)
trc();
```