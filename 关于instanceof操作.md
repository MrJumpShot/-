# instanceof操作解析

## `instanceof` 的原理是什么呢？
根据 `ECMAScript` 语言规范，整理了一段代码如下
```
    function new_instance_of(leftVaule, rightVaule) { 
        let rightProto = rightVaule.prototype; // 取右表达式的 prototype 值
        leftVaule = leftVaule.__proto__; // 取左表达式的__proto__值
        while (true) {
        if (leftVaule === null) {
                return false;  
            }
            if (leftVaule === rightProto) {
                return true;  
            } 
            leftVaule = leftVaule.__proto__ 
        }
    }
```
其实 `instanceof` 主要的实现原理就是只要右边变量的 `prototype` 在左边变量的原型链上即可。因此，`instanceof` 在查找的过程中会遍历左边变量的原型链，直到找到右边变量的 `prototype`，如果查找失败，则会返回 `false`，告诉我们左边变量并非是右边变量的实例。

## 特殊例子

```
    Object instanceof Object   // true
    Object instanceof Function    //true
    Function instanceof Object    //true
    Function instanceof Function    //true
    Array instanceof Function    //true
    Array instanceof Object    //true
```

### 解释

首先Object是一个构造函数，既然是构造函数那在语言内部就是通过Function这个构造函数new出来的，那么Object的__proto__自然就指向Function的prototype
```
    Object.__proto__ === Function.prototype    // true
```
我们打印一下Function.prototype看看
```
    ƒ () { [native code] }

    // typeof Function.prototype === 'function'
```

这里看起来是一个函数，其实我也不是很清楚为什么这个函数的__proto__就指向Object.prototype了

```
    Function.prototype.__proto__ === Object.prototype
```

虽然有点疑问，但是就可以解释上面的这些关系了，因为Function自身绕成了一个圈

```
    Function.__proto__ === Function.prototype    // true
```

