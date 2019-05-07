# 实现apply、call、bind方法

> apply方法传参是数组形式，call传参方式是直接传入参数列表

## 1、实现apply方法

    Function.prototype.apply2 = function(context, args) {
        context = context || window;
        const { fn } = context;
        // 这里的this就是调用该方法的函数，相当于是把调用apply2方法的函数赋值给了context，然后再利用对象调用方法的形式来实现绑定函数内部的this，这也是为什么箭头函数不能使用apply的原因，因为箭头函数作为对象方法的时候并不能绑定this
        context.fn = this;
        const result = context.fn(...args);
        context.fn = fn;
        return result;
    }

    const obj = {
        name: 'alex',
        age: 23,
    }

    function show(...args) {
        console.log(this.name, this.age);
        console.log(...args);
    }

    show.apply(obj, [100, 200])

## 实现call方法

> 实现的方法与apply的实现类似

    Function.prototype.call2 = function(context, ...args) {
        context = context || window;
        const { fn } = context;
        // 这里的this就是调用该方法的函数，相当于是把调用apply2方法的函数赋值给了context，然后再利用对象调用方法的形式来实现绑定函数内部的this，这也是为什么箭头函数不能使用apply的原因，因为箭头函数作为对象方法的时候并不能绑定this
        context.fn = this;
        const result = context.fn(...args);
        context.fn = fn;
        return result;
    }

## 实现bind方法

> bind方法的实现与前面二者有所区别，主要区别在于：1、bind方法返回一个函数 2、考虑作为构造函数的情况

    Function.prototype.bind2 = function(context, ...args) {
        //保存当前函数
        let _this = this;
        return function F(...newArgs) {
            //bind返回的是个函数，所以可以实例化一个对象返回
            if (this instanceof F) {
                return new _this(...args,...newArgs);
            } else {
                return _this.apply(context,args.concat(newArgs));
            }
        }
    }

    function show(a, b) {
        this.a = a;
        this.b = b;
    }

    const obj = {
        name: 'alex',
    }

    let fn = show.bind(obj, 100);

    const obj1 = new fn(200);

    console.log(obj, obj1) // {name: 'alex'}, {a: 100, b: 200}
