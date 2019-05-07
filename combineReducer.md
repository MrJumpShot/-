# combineReducer源码解析

> combineReducer方法用于将多个小的reducer组合成总的reducer

    export default function combineReducers(reducers) {  
        var reducerKeys = Object.keys(reducers);
        var finalReducers = {};
        for (var i = 0; i < reducerKeys.length; i++) {
            var key = reducerKeys[i];

            if (typeof reducers[key] === 'function') {
                finalReducers[key] = reducers[key];
            }
        }
        var finalReducerKeys = Object.keys(finalReducers);

        //从上面到这里都是为了保存finalReducerKeys 和 finalReducers

        //返回的combination函数就相当于结合所有reducers之后新的reducer
        return function combination() {
            var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var action = arguments[1];

            var hasChanged = false;
            var nextState = {};

            //这里遍历了所有之前自定义的reducers，并记录下是否state有改变，并记录下改变的state
            for (var _i = 0; _i < finalReducerKeys.length; _i++) {
                var _key = finalReducerKeys[_i];
                var reducer = finalReducers[_key];
                var previousStateForKey = state[_key];

                //遍历所有的reducer，若previousStateForKey匹配到则返回新的state
                //若匹配不到就在reducer中dufault中返回原state
                var nextStateForKey = reducer(previousStateForKey, action);
                nextState[_key] = nextStateForKey;

                //这里有点意思，并没有因为找到不同的state就直接返回
                //这意味着，多个子reducers可以对同个action返回自己的state
                //并且返回的state是依据靠后的reducer的返回值决定的
                hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
            }
            return hasChanged ? nextState : state;
        };
    }