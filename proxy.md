# Proxy的使用和注意点

* 注意何时会触发set和get
```
    let obj = {
        a: 1,
        info: {
            name: 'eason',
            blogs: ['webpack', 'babel', 'cache']
        }
    }
    let handler = {
        get (target, key, receiver) {
            console.log('get', key)
            // 递归创建并返回
            if (typeof target[key] === 'object' && target[key] !== null) {
                return new Proxy(target[key], handler)
            }
            return Reflect.get(target, key, receiver)
        },
        set (target, key, value, receiver) {
            console.log('set', key, value)
            return Reflect.set(target, key, value, receiver)
        }
    }
    let proxy = new Proxy(obj, handler)// 相当于objPro.c = objPro.c + 1,一次get一次set
    // get a
    // set a 2
    proxy.a++;
    proxy.info.name = 'Zoe'
    proxy.info.blogs.push('proxy')
    // get info
    // set name Zoe
    // get info
    // get blogs
    // get push
    // get length
    // set 3 proxy
    // set length 4

```

* Proxy 实例也可以作为其他对象的原型对象。
```
    var proxy = new Proxy({}, {
        get: function(target, property) {
            return 35;
        }
    });

    let obj = Object.create(proxy);
    obj.time // 35
```

> 上面代码中，proxy对象是obj对象的原型，obj对象本身并没有time属性，所以根据原型链，会在proxy对象上读取该属性，导致被拦截。
> 注意只有当读取的属性是在该原型对象上的时候才会被拦截，如果是操作实例自己的属性则不会被拦截。


```
    let obj1 = {}

    var proxy = new Proxy(obj1, {
        // 注意，receiver指的是调用的对象，如执行obj.a的时候，reveiver===obj，当执行proxy.a的时候，receiver===proxy。
        get: function(target, name, receiver) {
            console.log('get')
            return Reflect.get(target, name, receiver);
        },
        set(target, name, value, receiver) {
            console.log('this is set')
            console.log(receiver === obj)
            Reflect.set(target, name, value, receiver)
        }
    });

    let obj = Object.create(proxy);
    obj.a = 12 // this is set, true
    console.log(obj.a) // 12, this is get
    proxy.v = 1000 // this is set, false
    // 注意proxy的结果本身就是一个对象，在进行proxy.v = 1000的操作的时候，该对象本身就有了v这个属性
    obj.v1 = 100000 // this is set, true


    console.log(obj, obj1, proxy) // { a: 12, v1: 100000 } { v: 1000 } { v: 1000 }
    // 其中proxy还有一些隐藏的属性 __proto__: Proxy => {[[handler]], [[target]]} target就是obj1

    console.log(proxy === obj1) //false

```