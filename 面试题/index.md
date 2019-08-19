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

## 2. 找到第一个缺失的正整数

> 给定一个数组，譬如`[-1, 3, 5, 0, 1]`，数组里面只含有整数，找出其中第一个缺失的正整数


这个问题的解法和找到两个人缺失的整数是类似的，方法就是先把各个数组项归为，再遍历一遍，这样就不需要额外的空间


## 3. 一个父级元素下面有一个子级元素，如何让子级元素的宽高都是父级的一半（父级宽高不定）

```
    .parent {
        position: relative;
    }
    .child {
        width: 50%;
        height: 0;
        padding-top: 50%;
        // padding-top设置百分比时相对于非static定位的父级的宽度
    }
```

## 4.

```
    function Foo() {
        getValue = function() {     
            console.log(1)     
        }     
        // 注意上面这行的赋值没有使用var或者let，那么一旦执行Foo()就会覆盖全局的getValue函数
        return this;
    } 
    Foo.getValue = function() {     
        console.log(2) 
    } 
    Foo.prototype.getValue = function() {     
        console.log(3) 
    }  
    function getValue() {     
        console.log(4) 
    } 
    getValue = function() {     
        console.log(5) 
    } 
    Foo.getValue(); 
    Foo().getValue(); // 先执行Foo(),返回的this指向window，同时把全局的getValue函数改成了Foo内部赋值的那个，所以这里和后面打出来的都是1
    getValue();

    // 如果注掉Foo().getValue();这一行，那么最后一行打出来的是5

```