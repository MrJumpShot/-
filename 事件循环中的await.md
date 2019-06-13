# 不同环境的事件循环涉及await的情况

```
    console.log('script start')

    async function async1() {
        await async2()
        console.log('1111')
        await async3()
        console.log('222')
        await async4()
        console.log('async1 end')
    }

    async function async2() {
        console.log('async2 end')
    }
    async function async3() {
        console.log('async3 end')
    }
    async function async4() {
        console.log('async4 end')
    }
    async1()

    setTimeout(function() {
        console.log('setTimeout')
    }, 0)

    new Promise(resolve => {
        console.log('Promise')
        resolve()
    }).then(() => {
        console.log('promise1')
    }).then(() => {
        console.log('promise2')
    }).then(() => {
        console.log('promise3')
    }).then(() => {
        console.log('promise4')
    }).then(() => {
        console.log('promise5')
    }).then(() => {
        console.log('promise6')
    }).then(() => {
        console.log('promise7')
    }).then(() => {
        console.log('promise8')
    }).then(() => {
        console.log('promise9')
    }).then(() => {
        console.log('promise10')
    })

    console.log('script end')

```
> 上面这样一段代码，在v8引擎的环境下执行得到的结果是这样的：
```
    script start
    async2 end
    Promise
    script end
    async3 end
    promise1
    async4 end
    promise2
    async1 end
    promise3
    promise4
    promise5
    promise6
    promise7
    promise8
    promise9
    promise10
    setTimeout
```
> 而在node环境下的执行结果是这样的:
```
    script start
    async2 end
    Promise
    script end
    promise1
    promise2
    async3 end
    promise3
    promise4
    promise5
    async4 end
    promise6
    promise7
    promise8
    async1 end
    promise9
    promise10
    setTimeout
```

> 若将后面几个async函数改为普通函数，则二者的执行结果相同
> 产生这样的原因：

> V8引擎在碰到await时，如果await后面跟的是promise对象，则直接执行该内容，但是在这一行后面的内容都将被放进一个微任务内。如果await后面是一个普通函数时，则继续执行后面的内容，不必将后面的内容放进微任务

> node引擎在处理await后面是普通函数的方式与V8引擎是一样的，都是直接执行，但是在执行await后面是promise对象的时候，则会将后面的内容多次放进微任务中，从输出的结果看，应该是三次放进微任务中