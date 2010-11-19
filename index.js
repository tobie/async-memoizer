var _slice = Array.prototype.slice;

exports.memoize = memoize;
function memoize(obj, methodName) {
  var originalMethod = obj[methodName],
      memoizedValues = '_async_memoizer_values_for_' + methodName;
      
  function wrapper() {
    var lastIndex = arguments.length - 1,
        callback = arguments[lastIndex],
        memoizedValues = this[memoizedValues],
        self = this;
    
    if (typeof callback != 'function') {
      throw new Error("Cannot memoize method whose last argument isn't a callback function.");
    }
    
    if (memoizedValues) {
      process.nextTick(function() {
        callback.apply(null, memoizedValues);
      });
    } else {
      var args = _slice.call(arguments, 0, lastIndex);
      args.push(function() {
        self[memoizedValues] = arguments;
        callback.apply(null, arguments);
      });
      originalMethod.apply(this, args);
    }
  }
  obj[methodName] = wrapper;
}
