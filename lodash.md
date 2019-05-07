# lodash学习

> 首先lodash的所有函数都不会在原有的数据上进行操作，而是复制出一个新的数据而不改变原有数据。类似immutable.js的理念去处理。  
---
> 番外
> > [] == 0 // true  
> > null == 0 // false  
> > undefined == 0 // false  
> > null + 0 // 0  
> > null / 2 // 0  
> > null % 2 // 0  
> > undefined + 0 // NaN  
---

* _.get(obj, path, [defaultValue])  在实际中很有用，对于数据请求来的值可以设置defaultValue进行容错处理

> defalutValue不设置时取undefined  
> var object = { 'a': [{ 'b': { 'c': 3 } }] };  
> _.get(object, 'a[0].b.c');  
> // => 3  
> _.get(object, ['a', '0', 'b', 'c']);  
> // => 3  
> _.get(object, 'a.b.c', 'default');  
> // => 'default'  

    const _ = require('lodash');

    const arr = [1, 2, 3, 4, 5, 6, 1, 2, 0, NaN, null, [], undefined, ''];

    const chunk = _.chunk(arr, 7)  // 第二个参数为size

    _.uniq(arr)  // 去重

    _.compact(arr) // 去掉null, false, undefined, 0, '', 不会去掉[]

    _.filter(arr, n => n % 2 === 0)

    _.reject(arr, n => n % 2 === 0)  // 作用与filter相反

    _.map(arr, n => n)

    _.merge([1, 2], [3, 4, 5])  // [3, 4, 5]

    _.merge({a: 12, b: [{c: 1}]}, {a: 100, b: [{e: 3}]}) // {a: 100, b: [{c: 1, e: 3}]}

    _.keys('hello')  // ['0', '1', '2', '3', '4']

    _.get([20, 10], 0, 100);  // 20

    _.get({a: {b: {c: 100}}}, 'f')  // undefined

    _.includes(arr, NaN)  // true

    _.every(arr, n => n > 5)  // false

    _.some(arr, n => n > 5)  //true

    _.uniqueId(), _.uniqueId(), _.uniqueId() // 1, 2, 3

    var users = {
        'barney':  { 'age': 36, 'active': true },
        'fred':    { 'age': 40, 'active': false },
        'pebbles': { 'age': 1,  'active': true }
    };

    // _.findKey返回的是第一个匹配的结果，
    // _.findLastKey返回最后一个匹配结果  即反向遍历
    _.findKey(users, function(o) { return o.age < 40; });
    // => 'barney' (iteration order is not guaranteed)

    // The `_.matches` iteratee shorthand.
    _.findKey(users, { 'age': 1, 'active': true });
    // => 'pebbles'

    // The `_.matchesProperty` iteratee shorthand.
    _.findKey(users, ['active', false]);
    // => 'fred'

    // The `_.property` iteratee shorthand.
    _.findKey(users, 'active');
    // => 'barney'