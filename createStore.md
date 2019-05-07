# createStore源码

    export default function createStore(reducer, preloadedState, enhancer) {
        var _ref2;

        if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
            enhancer = preloadedState;
            preloadedState = undefined;
        }

        if (typeof enhancer !== 'undefined') {
            if (typeof enhancer !== 'function') {
                throw new Error('Expected the enhancer to be a function.');
            }

            return enhancer(createStore)(reducer, preloadedState);
        }

        // 设置currentReducer是为了可以replaceReducer
        var currentReducer = reducer;          //
        var currentState = preloadedState;     //当前的state
        var currentListeners = [];           //订阅函数
        var nextListeners = currentListeners;//订阅函数备份，
        //用于解决listeners数组执行过程（for循环）中，取消订阅listener产生的listeners数组index错误。
        //这样保证在某个dispatch后，会保证在这个dispatch之前的所有事件监听器全部执行？？？？

        var isDispatching = false;               //dispatch方法同步标志

        function ensureCanMutateNextListeners() {
            if (nextListeners === currentListeners) {
                nextListeners = currentListeners.slice();
            }
        }

        /**
        * @returns {any} 当前state
        */
        function getState() {
            return currentState;
        }

        /*
        * 将一个订阅函数放到 listeners 队列里，当 dispatch 的时候，逐一调用 listeners 中的回调方法。
        * @param {Function} listener函数
        * @return {Function} 解除绑定的方法
        */
        function subscribe(listener) {
            if (typeof listener !== 'function') {
                throw new Error('Expected listener to be a function.');
            }

            var isSubscribed = true;

            ensureCanMutateNextListeners();
            nextListeners.push(listener);

            //解除订阅的方法，
            return function unsubscribe() {
                // 此处可以避免多次解除订阅的操作
                if (!isSubscribed) {
                    return;
                }

                isSubscribed = false;

                ensureCanMutateNextListeners();
                var index = nextListeners.indexOf(listener);
                nextListeners.splice(index, 1);
            };
        }

        /**
        * dispatch方法,调用reducer
        *
        * @param {Object} action
        *
        * @returns {Object} 一般会返回action,
        * 如果使用了中间件，可能返回promise 或者function之类的（）
        */
        function dispatch(action) {
            ......

            //dispatch是同步的，用isDispatching标志来判断
            if (isDispatching) {
                throw new Error('Reducers may not dispatch actions.');
            }
            //调用reducer
            try {
                isDispatching = true;
                //更新state树
                currentState = currentReducer(currentState, action);
            } finally {
                isDispatching = false;
            }

            //调用nextListeners中的监听方法
            var listeners = currentListeners = nextListeners;
            for (var i = 0; i < listeners.length; i++) {
                var listener = listeners[i];
                listener();
            }

            return action;
        }

        /**
        * 替换reducer
        */
        function replaceReducer(nextReducer) {
            if (typeof nextReducer !== 'function') {
                throw new Error('Expected the nextReducer to be a function.');
            }

            currentReducer = nextReducer;
            //触发生成新的state树
            dispatch({ type: ActionTypes.INIT });
        }

        function observable() {
            ......
        }

        // 生成初始state树
        dispatch({ type: ActionTypes.INIT });

        return _ref2 = {
            dispatch: dispatch,
            subscribe: subscribe,
            getState: getState,
            replaceReducer: replaceReducer
        }, _ref2[$$observable] = observable, _ref2;
    }