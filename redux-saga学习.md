# redux-saga 学习

## helpers

helpers就是redux-saga提供的一些高级api，来帮助用户免去实现高级功能的过程，主要的helpers有以下这些

1. takeEvery  表示所有的action都会被接收到并处理，处理的方式是在background里面parallel执行的，因为其更底层的实现是通过take和fork两个effect实现，而fork的特点就是无阻塞。下面的代码是takeEvery的实现

```
    // 可以发现首先takeEvery本身就是一个fork的执行结果，这就意味着多个takeEvery一起写并不会阻塞
    // 其次在takeEvery内部也是take和fork一起实现的，这就意味着takeEvery不会漏掉任何一个匹配的action，都会在background运行
    const takeEvery = (patternOrChannel, saga, ...args) => fork(function*() {
        while (true) {
            const action = yield take(patternOrChannel)
            yield fork(saga, ...args.concat(action))
        }
    })

```

2. takeLatest  表示接收所有的action，但是如果有新的action触发的时候，而前面的action还没有结束时就会直接cancel前面开启的任务，从而实际运行的都是最新的action所触发的任务。由以上描述可以知道takeLatest是由take，fork和cancel实现的。下面是takeLatest的实现

```
    // takeLatest也是fork出来的任务，所以和takeEvery一样本身是不阻塞的
    const takeLatest = (patternOrChannel, saga, ...args) => fork(function*() {
        let lastTask
        while (true) {
            const action = yield take(patternOrChannel)
            if (lastTask) {
            yield cancel(lastTask) // cancel is no-op if the task has already terminated
            }
            lastTask = yield fork(saga, ...args.concat(action))
        }
    })
```

## effects
effects是一些基础的api，由这些api可以实现helpers，但是直接使用effects可以更灵活的实现各种对control flow的控制。

主要的effects有以下这些：

1. take
   
   take这个effect的作用就是在等待一个action，在等到的时候就resolve出来一个action，如果相应的action没有触发的话就take就一直处于pending状态。

2. call
   
   call的作用是去调用一些功能函数，其实在saga内部也可以直接调用功能函数不通过call来调用，但是这样带来的缺点就是做单元测试很困难，而使用call来实现的话单元测试就很简单。call是同步执行的。
   yield call(fn, ...args)的返回结果是fn的结果

3. fork

    fork的功能和call类似，区别在于fork是非阻塞的，执行fork返回的是一个任务，这个任务可以被cancel取消
    文档对于fork的解释：
    > yield fork results in a Task Object. We assign the returned object into a local constant task. Later if we take a LOGOUT action, we pass that task to the cancel Effect. If the task is still running, it'll be aborted. If the task has already completed then nothing will happen and the cancellation will result in a no-op. And finally, if the task completed with an error, then we do nothing, because we know the task already completed.
4. put

    put的作用是触发一个action，用put而不直接dispatch一个action也是为了方便做单元测试。


### take的灵活使用

来看一个例子：

```
    import { take, put } from 'redux-saga/effects'

    function* watchFirstThreeTodosCreation() {
        for (let i = 0; i < 3; i++) {
            const action = yield take('TODO_CREATED')
        }
        yield put({type: 'SHOW_CONGRATULATION'})
    }
    // 在这里就是接受了三次添加的action之后就不再接受这个action，而是触发一个祝贺的action，随后这个saga也就结束了，直接使用take来实现很简单，但是如果使用takeEvery或是takeLatest的话就难以实现，可以初步看到take的灵活之处。
```

接着来看一个loginFlow：

```
    function* loginFlow() {
        while (true) {
            yield take('LOGIN')
            // ... perform the login logic
            yield take('LOGOUT')
            // ... perform the logout logic
        }
    }
    // 在使用take实现loginFlow的时候只需要一个逻辑块，流程很清楚，但是如果使用takeEvery的话就需要两个逻辑块分别维护login的状态和logout的状态

```

接下来对loginFlow进行完善：

```
    import { take, call, put } from 'redux-saga/effects'
    import Api from '...'

    function* authorize(user, password) {
        try {
            const token = yield call(Api.authorize, user, password)
            yield put({type: 'LOGIN_SUCCESS', token})
            return token
        } catch(error) {
            yield put({type: 'LOGIN_ERROR', error})
        }
    }

    function* loginFlow() {
        while (true) {
            const {user, password} = yield take('LOGIN_REQUEST')
            const token = yield call(authorize, user, password)
            if (token) {
                yield call(Api.storeItem, {token})
                yield take('LOGOUT')
                yield call(Api.clearItem, 'token')
            }
        }
    }
    // 上面的流程是触发login的action后call了authorize的函数，然后就等待执行结果，如果成功就返回token，失败就触发login error。如果login成功就可以进入if块，保存token并等待logout的action，但是如果login失败就有循环到等待login的状态。
    // 看似流程很完美，但是问题在于如果用户点击了login之后正在authorize，但是这时用户又想logout了，这时logout的action将会被Miss。因为整个流程在call的阶段pending着。
```

进一步改造：

```
    import { fork, call, take, put } from 'redux-saga/effects'
    import Api from '...'

    function* authorize(user, password) {
        try {
            const token = yield call(Api.authorize, user, password)
            yield put({type: 'LOGIN_SUCCESS', token})
            yield call(Api.storeItem, {token})
        } catch(error) {
            yield put({type: 'LOGIN_ERROR', error})
        }
    }

    function* loginFlow() {
        while (true) {
            const {user, password} = yield take('LOGIN_REQUEST')
            yield fork(authorize, user, password)
            yield take(['LOGOUT', 'LOGIN_ERROR'])
            yield call(Api.clearItem, 'token')
        }
    }
    // 利用fork代替call可以解决阻塞的问题
    // 但是也带来了新的问题
    // 如果在authorize的过程中触发logout，随后authorize成功就会出现问题，就是后续无法直接登出了
```

解决上述问题：

```
    import { take, put, call, fork, cancel } from 'redux-saga/effects'

    // 解决方法就是如果logout触发的话就cancel前面login的task

    function* loginFlow() {
        while (true) {
            const {user, password} = yield take('LOGIN_REQUEST')
            // fork return a Task object
            const task = yield fork(authorize, user, password)
            const action = yield take(['LOGOUT', 'LOGIN_ERROR'])
            if (action.type === 'LOGOUT')
            yield cancel(task)
            yield call(Api.clearItem, 'token')
        }
    }
```

最后对authorize函数改造一下，来应对如果中途被cancel的情况：

```
    import { take, call, put, cancelled } from 'redux-saga/effects'
    import Api from '...'

    function* authorize(user, password) {
        try {
            const token = yield call(Api.authorize, user, password)
            yield put({type: 'LOGIN_SUCCESS', token})
            yield call(Api.storeItem, {token})
            return token
        } catch(error) {
            yield put({type: 'LOGIN_ERROR', error})
        } finally {
            if (yield cancelled()) {
            // ... put special cancellation handling code here
            }
        }
    }
    // 对其添加finally块，里面的逻辑即使是task被cancel也会执行的，这样就可以在里面放一些clean的逻辑
    // 譬如在login触发后authorize的过程中set了isLogin为true，这时有spinner在转，但是随即就触发了logout action，如果不做一些清理的措施，isLogin就会保持true，这时就需要在finally块中做一些清理的逻辑

```


## 错误处理方式

1. try-catch方式：

```
    import Api from './path/to/api'
    import { call, put } from 'redux-saga/effects'

    // 如果在Api.fetch的过程中报错的话就进入catch

    function* fetchProducts() {
        try {
            const products = yield call(Api.fetch, '/products')
            yield put({ type: 'PRODUCTS_RECEIVED', products })
        }
        catch(error) {
            yield put({ type: 'PRODUCTS_REQUEST_FAILED', error })
        }
    }
```

2. 改造api来避免使用try-catch
   
```
    import Api from './path/to/api'
    import { call, put } from 'redux-saga/effects'

    function fetchProductsApi() {
        return Api.fetch('/products')
            .then(response => ({ response }))
            .catch(error => ({ error }))
    }
    // 对api进行了改造，对于是否报错返回不同的内容，由于这里已经catch了error，那么在generator function里面就不需要再做try-catch的操作了

    function* fetchProducts() {
        const { response, error } = yield call(fetchProductsApi)
        if (response)
            yield put({ type: 'PRODUCTS_RECEIVED', products: response })
        else
            yield put({ type: 'PRODUCTS_REQUEST_FAILED', error })
    }
```


...未完待续