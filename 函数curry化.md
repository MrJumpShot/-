# 函数curry化

> 关于函数curry化的定义：

1. 泛化的curry化
```
    let sum=function () {
        var total = 0;
        for (let i = 0, c; c = arguments[i++];) {
            total += c;
        }
        return total;
    };

    let curry = (fn) => {
        let args = [];

        // 不用callee这个属性，而是直接使用函数名字来调用
        return function next() {
            if(arguments.length === 0) {
                return fn.apply(this, args);
            }
            // curry化之后的函数使用方式是，不断收集参数，认为参数收集完毕之后就进行一次无参调用进行最后的计算。
            // 所以curry化在这里的作用其实就是收集参数，当然不同的curry函数可以达到不同的效果
            args = [...args, ...arguments];
            // return arguments.callee;
            return next;
        }
    }


    let sum_curry1 = curry(sum);
    sum_curry1(1)(2,3);
    sum_curry1(4);
    console.log(sum_curry1());
```

## curry化的作用

1. 提高适用性
> 【通用函数】解决了兼容性问题，但同时也会再来，使用的不便利性，不同的应用场景往，要传递很多参数，以达到解决特定问题的目的。有时候应用中，同一种规则可能会反复使用，这就可能会造成代码的重复性。
看下面一个例子：
```
    function square(i) {
        return i * i;
    }

    function dubble(i) {
        return i *= 2;
    }

    function map(handeler, list) {
        return list.map(handeler);
    }

    // 数组的每一项平方
    map(square, [1, 2, 3, 4, 5]);
    map(square, [6, 7, 8, 9, 10]);
    map(square, [10, 20, 30, 40, 50]);
    // ......

    // 数组的每一项加倍
    map(dubble, [1, 2, 3, 4, 5]);
    map(dubble, [6, 7, 8, 9, 10]);
    map(dubble, [10, 20, 30, 40, 50]);
```

> 例子中，创建了一个map通用函数，用于适应不同的应用场景。显然，通用性不用怀疑。同时，例子中重复传入了相同的处理函数：square和dubble。
应用中这种可能会更多。当然，通用性的增强必然带来适用性的减弱。但是，我们依然可以在中间找到一种平衡。

2. 延迟执行。

> 柯里化的另一个应用场景是延迟执行。不断的柯里化，累积传入的参数，最后执行。
看下面：
```
    let curry = (fn) => {
        let args = [];

        // 不用callee这个属性，而是直接使用函数名字来调用
        return function next() {
            if(arguments.length === 0) {
                return fn.apply(this, args);
            }
            // curry化之后的函数使用方式是，不断收集参数，认为参数收集完毕之后就进行一次无参调用进行最后的计算。
            // 所以curry化在这里的作用其实就是收集参数，当然不同的curry函数可以达到不同的效果
            args = [...args, ...arguments];
            // return arguments.callee;
            return next;
        }
    }
```
 
3. 固定易变因素。
> 柯里化特性决定了它这应用场景。提前把易变因素，传参固定下来，生成一个更明确的应用函数。最典型的代表应用，是bind函数用以固定this这个易变对象。
```
    Function.prototype.bind = function(context) {
        var _this = this,
        _args = Array.prototype.slice.call(arguments, 1);
        return function() {
            return _this.apply(context, _args.concat(Array.prototype.slice.call(arguments)))
        }
    }
```


