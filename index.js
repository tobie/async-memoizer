var _slice = Array.prototype.slice,
    NON_FUNCTION_CALLBACK_ERROR = "Cannot memoize method whose last argument isn't a callback function.";

exports.memoize = memoize;
function memoize(obj, methodName) {
  var originalMethod = obj[methodName],
      _unaryCache, _nAryCache;
      
  function wrapper(callback) {
    if (arguments.length == 1) {
      if (typeof callback != 'function') {
        throw new Error(NON_FUNCTION_CALLBACK_ERROR);
      }
      
      if (_unaryCache) {
        process.nextTick(function() { callback.apply(null, _unaryCache); });
      } else {
        originalMethod.call(this, function() {
          _unaryCache = arguments;
          callback.apply(null, arguments);
        });
      }
    } else {
      var lastIndex = arguments.length - 1,
          args = _slice.call(arguments, 0, lastIndex),
          callback = arguments[lastIndex],
          key = _getKey(args),
          cache;
      
      if (typeof callback != 'function') {
        throw new Error(NON_FUNCTION_CALLBACK_ERROR);
      }
      
      _nAryCache = _nAryCache || {};
      cache = _nAryCache[key];
      
      if (cache) {
        process.nextTick(function() { callback.apply(null, cache); });
      } else {
        args.push(function() {
          _nAryCache[key] = arguments;
          callback.apply(null, arguments);
        });
        originalMethod.apply(this, args);
      }
    }
  }
  
  wrapper.resetMemoizationCache = resetMemoizationCache;
  function resetMemoizationCache() {
    _unaryCache = _nAryCache = null;
  }
  
  wrapper.stopMemoization = stopMemoization;
  function stopMemoization() {
    obj[methodName] = originalMethod;
  }
  
  obj[methodName] = wrapper;
}

function _getKey(args) {
  var arg, type, output = [];
  for (var i = 0, length = args.length; i < length; i++) {
    arg = args[i];
    type = typeof(arg);
    switch (type) {
      case 'number':
      case 'string':
      case 'boolean':
        output.push(JSON.parse(arg));
        break;
      case 'undefined':
        output.push('undefined');
        break;
      default:
        if (arg === null) {
          output.push('null');
        } else {
          throw new Error("Cannot memoize method with argument of type Object.");
        }
    }
  }
  return output.join(',');
}
