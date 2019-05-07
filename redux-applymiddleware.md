# applyMiddleware源码

> applymiddleware方法返回一个接受createStore函数作为参数的函数，该函数实质上就是createStore函数的最后一个参数enhancer，用来加强store的dispatch方法，返回的函数是一个enhance以后的createStore函数，接受reducer和preloadedState作为参数来新建一个store。

    export default function applyMiddleware() {
        //middlewares保存传进来的中间件
        for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
            middlewares[_key] = arguments[_key];
        }

        //createStore是创建createStore的函数，会在下文解读，这里先不管
        return function (createStore) {
            return function (reducer, preloadedState, enhancer) {
                //创建store 并获取了其dispatch方法
                var store = createStore(reducer, preloadedState, enhancer);
                var _dispatch = store.dispatch;
                var chain = [];

                //用于传递给中间件第一层函数的参数，上文在thunk中有看到
                var middlewareAPI = {
                    getState: store.getState,
                    dispatch: function dispatch(action) {
                    return _dispatch(action);
                    }
                };

                //middlewares保存的是中间件，chain对应保存的就是中间件第二层函数组成的数组
                //形象点就是上文中间件格式去掉第一层：next => action => {}
                chain = middlewares.map(function (middleware) {
                    return middleware(middlewareAPI);
                });

                //1. compose的功能在上文说到，假设chain为[F1,F2,F3],compose之后变成了F1(F2(F3))
                //2. 与上文thunk中说到中间件格式对应，F3是中间件链的最内环 所以F3的next参数为store.dispatch
                //3. F2的next参数就是F3返回的 action => {}
                //4. 同样的F1的next参数就是F2返回的 action => {}
                //
                //_dispatch就相当于F1(F2(F3(store.dispatch)))
                //这样多个中间件就组合到了一起，形成了中间件链
                _dispatch = compose.apply(undefined, chain)(store.dispatch);

                //新的dispatch会覆盖原dispatch，之后调用dispatch同时会调用中间件链，执行一系列的中间件函数
                return _.extends({}, store, {
                    dispatch: _dispatch
                });
            };
        };
    }

    function createThunkMiddleware(extraArgument) {
        return ({ dispatch, getState }) => next => action => {
            if (typeof action === 'function') {
            return action(dispatch, getState, extraArgument);
            }
            return next(action);
        };
    }