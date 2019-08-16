# 面试题汇总

## 1

```
    var obj = {
        '2': 3,
        '3': 4,
        'length': 2,
        'splice': Array.prototype.splice,
        'push': Array.prototype.push
    }
    obj.push(1)
    obj.push(2)
    console.log(obj)
    // { '2': 1, '3': 2, length: 4, splice: [Function: splice], push: [Function: push] }
```

实际上数组的push方法是先取出数组的length，然后给`arr[length]`赋值，然后把length的值加一

其实这一系列操作可以通过proxy来观察到：

```
    let arr = [1, 2, 3];
    const handler = {
        get (target, key, receiver) {
            console.log('get key--->', key)
            return Reflect.get(target, key, receiver)
        },
        set (target, key, value, receiver) {
            console.log('set key--->', key)
            return Reflect.set(target, key, value, receiver)
        }
    }
    let proxy = new Proxy(arr, handler)
    proxy.push(100)
    // get key---> push
    // get key---> length
    // set key---> 3
    // set key---> length

```