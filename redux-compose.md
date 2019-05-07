# Redux的compose函数

> Redux中使用的compose函数与Koa中有所不同，因为Koa中要实现洋葱圈模型，所以必须要允许中间件执行过程中交出执行权，这就需要next函数来实现，而Redux中没有这个需求，所以compose函数的实现相对简单

    export default function compose(...funcs) {
        if (funcs.length === 0) {
            return arg => arg
        }

        if (funcs.length === 1) {
            return funcs[0]
        }

        return funcs.reduce((a, b) => (...args) => a(b(...args)))
    }

> compose函数实现的原理就是利用数组的reduce方法，将上一个函数执行的结果交给下一个函数

## 利用reduce方法实现数组去重

> 在Array的prototype上新建一个方法，然后任意数组实例调用该方法即可实现去重

    Array.prototype.duplicate = function() {
        // 此时this指代的就是调用该方法的数组
        return this.reduce((res, cur) => {
            if(res.indexOf(cur) === -1) {
                res.push(cur);
            }
            return res;
        }, [])
    }