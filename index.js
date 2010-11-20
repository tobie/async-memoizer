var _slice = Array.prototype.slice,
    NON_FUNCTION_CALLBACK_ERROR = "Cannot memoize method whose last argument isn't a callback function.";

exports.memoize = memoize;
function memoize(obj, methodName) {
  var originalMethod = obj[methodName],
      _unaryCache = '_unaryMemoizationCacheFor_' + methodName,
      _nAryCache = '_nAryMemoizationCacheFor_' + methodName;
  
  function wrapper(callback) {
    var self = this;
    if (arguments.length == 1) {
      if (typeof callback != 'function') {
        throw new Error(NON_FUNCTION_CALLBACK_ERROR);
      }
      
      if (self[_unaryCache]) {
        process.nextTick(function() { callback.apply(null, self[_unaryCache]); });
      } else {
        originalMethod.call(this, function() {
          self[_unaryCache] = arguments;
          callback.apply(null, arguments);
        });
      }
    } else {
      var lastIndex = arguments.length - 1,
          args = _slice.call(arguments, 0, lastIndex),
          callback = arguments[lastIndex],
          key,
          cache;
      
      if (typeof callback != 'function') {
        throw new Error(NON_FUNCTION_CALLBACK_ERROR);
      }
      
      try {
        key = _getKey(args)
      } catch(e) {
        originalMethod.apply(this, arguments);
        return;
      }
      
      self[_nAryCache] = self[_nAryCache] || {};
      cache = self[_nAryCache][key];
      
      if (cache) {
        process.nextTick(function() { callback.apply(null, cache); });
      } else {
        args.push(function() {
          self[_nAryCache][key] = arguments;
          callback.apply(null, arguments);
        });
        originalMethod.apply(this, args);
      }
    }
  }
  
  wrapper.originalMethod = originalMethod;
  obj[methodName] = wrapper;
}

exports.reset = reset;
function reset(obj, methodName) {
  obj['_unaryMemoizationCacheFor_' + methodName] = null;
  obj['_nAryMemoizationCacheFor_' + methodName] = null;
}

exports.stop = stop;
function stop(obj, methodName) {
  var originalMethod = obj[methodName].originalMethod;  
  if (typeof originalMethod == 'function') {
    obj[methodName] = originalMethod;
  }
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
