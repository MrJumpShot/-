# applyMiddleware源码

> applymiddleware方法返回一个接受createStore函数作为参数的函数，该函数实质上就是createStore函数的最后一个参数enhancer，用来加强store的dispatch方法，返回的函数是一个enhance以后的createStore函数，接受reducer和preloadedState作为参数来新建一个store。

1. applyMiddleware

    ```
        * @param {...Function} middlewares The middleware chain to be applied.
        * @returns {Function} A store enhancer applying the middleware.
        */
        export default function applyMiddleware(...middlewares) {
            // applyMiddleware函数的返回结果其实就是一个enhancer，这是createStore的第三个参数
            return createStore => (...args) => {
                const store = createStore(...args)
                let dispatch = () => {
                    throw new Error(
                        'Dispatching while constructing your middleware is not allowed. ' +
                        'Other middleware would not be applied to this dispatch.'
                        // 在middleware构建的过程中直接调用dispatch会报错，这样做的原因是在这里直接dispatch的话会有些middleware无法接收到这个action
                    )
                }

                const middlewareAPI = {
                    getState: store.getState,
                    dispatch: (...args) => dispatch(...args)
                }
                // middlewares保存的是中间件，chain对应保存的就是中间件第二层函数组成的数组
                // 形象点就是上文中间件格式去掉第一层：next => action => {}
                const chain = middlewares.map(middleware => middleware(middlewareAPI))

                // 1. compose的功能在上文说到，假设chain为[F1,F2,F3],compose之后变成了F1(F2(F3))
                // 2. 与上文thunk中说到中间件格式对应，F3是中间件链的最内环 所以F3的next参数为store.dispatch
                // 3. F2的next参数就是F3返回的 action => {}
                // 4. 同样的F1的next参数就是F2返回的 action => {}
                //
                // dispatch就相当于F1(F2(F3(store.dispatch)))
                // 这样多个中间件就组合到了一起，形成了中间件链
                dispatch = compose(...chain)(store.dispatch)

                return {
                    ...store,
                    dispatch
                }
            }
        }
    ```

2. redux-thunk
   
   ```
        function createThunkMiddleware(extraArgument) {
            return ({ dispatch, getState }) => next => action => {
                if (typeof action === 'function') {
                    // 如果发现action是一个函数就给action传入dispatch和getState
                    // 在action内部会直接调用dispatch，但是这时候调用不会有问题
                    // 原因在于在上一层已经dispatch构建完毕了，在action里面调用的dispatch已经是包装好的dispatch了
                    return action(dispatch, getState, extraArgument);
                }

                return next(action);
            };
        }
        // 最终返回的格式是 ({ dispatch, getState }) => next => action => {}
        const thunk = createThunkMiddleware();
        thunk.withExtraArgument = createThunkMiddleware;

        export default thunk;
   ```

3. compose函数

```
    const compose = (funcs) => {
        if(funcs.length === 0) {
            return args => args
        }
        if(funcs.length === 1) {
            return funcs[0];
        }
        return funcs.reduce((a, b) => (...args) => a(b(...args)))
    }
```

