# koa-compose 解析

    'use strict'

    module.exports = compose

    // compose函数需要传入一个数组队列 [fn,fn,fn,fn]

    function compose (middleware) {

        // 如果传入的不是数组，则抛出错误
        if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')

        // 数组队列中有一项不为函数，则抛出错误
        for (const fn of middleware) {
            if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
        }

        // compose函数调用后，返回的是以下这个匿名函数
        // 匿名函数接收两个参数，第一个随便传入，根据使用场景决定
        // 第一次调用时候第二个参数next实际上是一个undefined，因为初次调用并不需要传入next参数
        // 这个匿名函数返回一个promise
        return function (context, next) {
            let index = -1
            return dispatch(0)
            function dispatch (i) {
                // 如果传入i为负数且<=-1 返回一个Promise.reject携带着错误信息
                // 所以执行两次next会报出这个错误。将状态rejected，就是确保在一个中间件中next只调用一次

                if (i <= index) return Promise.reject(new Error('next() called multiple times'))

                // 执行一遍next之后,这个index值将改变
                index = i

                // 根据下标取出一个中间件函数
                let fn = middleware[i]

                // next在这个内部中是一个局部变量，值为undefined，因为初始没有传next的值
                // 当i已经是数组的length了，说明中间件函数都执行结束，执行结束后把fn设置为undefined
                // 问题：本来middleware[i]如果i为length的话取到的值已经是undefined了，为什么要重新给fn设置为undefined呢？
                if (i === middleware.length) fn = next

                //如果中间件遍历到最后了。那么。此时return Promise.resolve()返回一个成功状态的promise
                // 方面之后做调用then
                if (!fn) return Promise.resolve()

                // try catch保证错误在Promise的情况下能够正常被捕获。
                // 调用后依然返回一个成功的状态的Promise对象
                // 用Promise包裹中间件，方便await调用
                // 调用中间件函数，传入context（根据场景不同可以传入不同的值，在Koa传入的是ctx）
                // 第二个参数是一个next函数，可在中间件函数中调用这个函数
                // 调用next函数后，递归调用dispatch函数，目的是执行下一个中间件函数
                // next函数在中间件函数调用后返回的是一个promise对象
                // 读到这里不得不佩服作者的高明之处。
                try {
                    return Promise.resolve(fn(context, function next () {
                        return dispatch(i + 1)
                    }))
                } catch (err) {
                    return Promise.reject(err)
                }
            }
        }
    }