# koa-compose 解析

    'use strict';

    const compose = function(middlewares) {
        if(!Array.isArray(middlewares)) {
            Promise.reject(new Error('middlewares should be an array'))
        }

        for (const fn of middlewares) {
            if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
        }

        return function(context, next) {
            let index = -1;
            return dispatch(0);

            function dispatch(i) {
                if(index >= i) {
                    return Promise.reject(new Error('next() has been called multiple times'))
                }

                index = i;
                let fn = middlewares[i];
                if(i === middlewares.length) {
                    fn = undefined;
                }
                if(!fn) {
                    return Promise.resolve()
                }
                try {
                    Promise.resolve(fn(context, () => {
                        return dispatch(i + 1);
                    }))
                } catch(err) {
                    return Promise.reject(err)
                }
            }
        }
    }

    module.exports = compose;
