# redux-saga 学习

## helpers

helpers就是redux-saga提供的一些高级api，来帮助用户免去实现高级功能的过程，主要的helpers有以下这些

1. takeEvery  表示所有的action都会被接收到并处理，处理的方式是在background里面parallel执行的，因为其更底层的实现是通过take和fork两个effect实现，而fork的特点就是无阻塞。下面的代码是takeEvery的实现

```
    // 可以发现首先takeEvery本身就是一个fork的执行结果，这就意味着多个takeEvery一起写并不会阻塞
    const takeEvery = (patternOrChannel, saga, ...args) => fork(function*() {
        while (true) {
            const action = yield take(patternOrChannel)
            yield fork(saga, ...args.concat(action))
        }
    })

```