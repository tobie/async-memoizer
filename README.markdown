async-memoizer
==============

A memoizer for asynchronous methods which obeys node.js conventions (last argument is always a callback).

`async-memoizer` makes the memoization process external and transparent and keeps the method's asynchronous
behaviour by relying on `process.nextTick` for memoized results..

Usage
-----
    
    var obj = {
      readFile(callback) {
        require('fs').readFile('path/to/file.txt', 'utf8', callback);
      }
    };

    require('async-memoizer').memoize(obj, 'readFile');

License
-------

Licensed under the [MIT license][1], Copyright 2010 Tobie Langel.

[1]: http://github.com/tobie/async-memoizer/raw/master/LICENSE

