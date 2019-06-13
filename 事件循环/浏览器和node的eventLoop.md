# EventLoop

## 1、浏览器中的事件循环（浏览器端没有setImmediate）

> 浏览器中的事件循环主要是维护异步任务的回调函数的callback queue，但是异步任务之间是存在区别的，分为宏任务（macro-task）和微任务（micro-task），两种任务分别在各自的队列中。
> 浏览器拿到一段js代码后开始从上向下执行，对于同步代码直接执行，遇到异步任务则挂起，继续向下执行，若遇到定时任务（setTImeout，setInterval）时，定时器开启，相应的回调函数在定时器到时的时候是要进入宏任务队列中的，而在遇到Promise的then方法里面或者async的情况，则是将回调放入微任务队列。
> 等到所有的同步任务执行完毕后，浏览器开始检查微任务队列，若此时有微任务，则全部执行完，随后取出宏任务队列的第一个回调，执行，执行完再次清空微任务队列，依次循环......

    console.log('start')
    let start = Date.now()
    setTimeout(() => {
        console.log('timeout')
    }, 2000)
    while(Date.now() - start < 4000) {

    }

    async function async1() {
        console.log('async1');
        await async2();
        console.log('async1 end');
    }

    async function async2() {
        console.log('async2');
    }

    console.log('script start');
    setTimeout(function(){
        console.log('setTimeout');
    },0);
    async1();

    new Promise((res) => {
        console.log('Promise')
        res()
    }).then(() => {
        console.log('then')
    }).then(() => {
        console.log('then1')
    }).then(() => {
        console.log('then2')
    }).then(() => {
        console.log('then3')
    }).then(() => {
        console.log('then4')
    })
    console.log('sync end')

    // start
    // script start
    // async1
    // async2
    // Promise
    // sync end
    // then
    // then1
    // async1 end
    // then2
    // then3
    // then4
    // timeout
    // setTimeout

## Node中的事件循环

> 只有一个主线程，node开始执行脚本时，会先进事件循环初始化（同步任务，发出异步请求，规划定时器生效时间，执行promise.nextTick等），这时事件循环还未开始。
> Node中的事件循环分为六个阶段
> 1、timers（setTimeout，setInterval的回调）
> 2、IO callbacks（除去上述两种以及setImmediate和close callback的回调）
> 3、idle prepare 内部保留阶段
> 4、poll 轮询
> 5、check（setImmediate的回调）
> 6、close（close callback）
>> 当event loop到poll阶段时，如果存在timer并且timer未到超时时间，将会发生下面情况：
>> 则会把最近的一个timer剩余超时时间作为参数传入io_poll()中，这样event loop 阻塞在poll阶段等待时，如果没有任何I/O事件触发，也会由timerout触发跳出等待的操作，结束本阶段，然后在close callbacks阶段结束之后会在进行一次timer超时判断
>> process.nextTick和promise的then方法里面的函数会在同步任务执行完毕之后即开始执行，而且是一次性执行完毕，后续在每一个阶段结束后都会清空这两种函数
>> promise的then方法里面的函数也是和nextTick调用时机是一样的，只是优先级低于nextTick

    var fs = require('fs');

    fs.readFile('./test.js', () => {
        setTimeout(() => {
            console.log('setTimeout');
        }, 0);
        setImmediate(() => {
            console.log('setImmediate');
            Promise.resolve().then(() => {
            console.log('then1')
            }).then(() => {
            console.log('then11')
            })
            Promise.resolve().then(() => {
            console.log('then2')
            }).then(() => {
            console.log('then21')
            })
            process.nextTick(()=>{
            console.log('nextTick3');
            })
    });

    setImmediate(() => {
        console.log('setImmediate222')
    })
    setImmediate(() => {
        console.log('setImmediate333')
    })
    process.nextTick(()=>{
        console.log('nextTick1');
    })
    process.nextTick(()=>{
        console.log('nextTick2');
    })
    });

    // nextTick1
    // nextTick2
    // setImmediate
    // setImmediate222
    // setImmediate333
    // nextTick3
    // then1
    // then2
    // then11
    // then21
    // setTimeout

---
    var fs = require('fs')

    fs.readFile(__filename, () => {
        setTimeout(() => {
            console.log('timeout')
        }, 0)
        setImmediate(() => {
            console.log('immediate')
        })
    })

    上面代码的执行结果是确定的
    因为fs.readFile callback执行完后，程序设定了timer
    setImmediate，因此poll阶段不会被阻塞进而进入check阶段先执行
    setImmediate，最后close callbacks阶段结束后检查timer，执行timeout事件
    而如果把两个定时器不放在readFile里面则无法确定执行顺序

---

    const fs = require('fs');

    function someAsyncOperation(callback) {
    // 假设这个读取将用耗时95ms
    console.log('start')
        fs.readFile('./test.js', callback);
    }

    const timeoutScheduled = Date.now();
    setTimeout(() => {
        const delay = Date.now() - timeoutScheduled;
        console.log(`${delay}ms have passed since I was scheduled`);
        while(Date.now() - timeoutScheduled < delay + 1300) {

        }
    }, 1999);
    // 执行一些异步操作将耗时 95ms
    someAsyncOperation(() => {
        const startCallback = Date.now();
        console.log('---')
        // 执行一些可能耗时10ms的操作
        while (Date.now() - startCallback < 150) {
            // do nothing
        }
    });



    setImmediate(() => {
        const delay = Date.now() - timeoutScheduled;

        console.log(`${delay}ms setImmediate`);
    });


    async function a() {
        console.log('async')
        Promise.resolve().then(() => {
            console.log('async end')
        })
    }

    a()

    new Promise((res) => {
        console.log('promise')
        res()
    }).then(() => {
        console.log('then')
    }).then(() => {
        console.log('then1')
    }).then(() => {
        console.log('then2')
    })

    async function async1() {
        console.log('async1');
        await async2();
        console.log('async1 end');
    }

    async function async2() {
        console.log('async2');
    }

    console.log('script start');
        setTimeout(function(){
        console.log('setTimeout');
    },0);
    async1();

    new Promise((res) => {
        console.log('promise2')
        res()
    }).then(() => {
        console.log('then2')
    }).then(() => {
        console.log('then21')
    }).then(() => {
        console.log('then22')
    })

    while(Date.now() - timeoutScheduled < 2000) {

    }
    console.log('sync finish')
    console.log(Date.now() - timeoutScheduled)

    process.nextTick(() => {
        console.log('nextTick')
    })
    process.nextTick(() => {
        console.log('nextTick')
    })
    process.nextTick(() => {
        console.log('nextTick')
    })



    new Promise(function(resolve){
        console.log('promise1');
        resolve();
    }).then(function(){console.log('promise2')});
    console.log('script end');

    // start
    // async
    // promise
    // script start
    // async1
    // async2
    // promise2
    // sync finish
    // 2000
    // promise1
    // script end
    // nextTick
    // nextTick
    // nextTick
    // async end
    // then
    // async1 end
    // then2
    // promise2
    // then1
    // then21
    // then2
    // then22
    // setTimeout
    // 2004ms have passed since I was scheduled
    // 3305ms setImmediate
    // ---

### 注意下面这段代码在浏览器端和node端的表现不一样

> 产生不同的原因在于，浏览器端执行完一个宏任务后要清空微任务队列，而在node端则是一个阶段结束之后再去清空then方法的回调，而不是一个阶段里面的一个回调执行完就去清空那些方法

    setTimeout(() => {
        console.log('setTimeout');
    }, 0);
    setTimeout(() => {
        console.log('setTimeout1');
        Promise.resolve().then(() => {
            console.log('then1')
        }).then(() => {
            console.log('then11')
        })
        Promise.resolve().then(() => {
            console.log('then2')
        }).then(() => {
            console.log('then21')
        })

    });

    setTimeout(() => {
        console.log('setTimeout2')
    })
    setTimeout(() => {
        console.log('setTimeout3')
    })


## 关于轮询阶段（poll）

此阶段有两个主要的功能：

执行已过时的定时器脚本；
处理轮询队列中的事件。
当事件循环进入轮询阶段并且没有计时器时，会发生以下两件事之一：

如果轮询队列不为空，则事件循环将遍历其回调队列，同步执行它们，直到队列耗尽或达到系统相关硬限制。
如果轮询队列为空，则会发生以下两件事之一：
1）如果脚本已通过setImmediate()进行调度，则事件循环将结束轮询阶段并继续执行检查阶段以执行这些预定脚本。
2）如果脚本没有通过setImmediate()进行调度，则事件循环将等待回调被添加到队列中，然后立即执行它们。

一旦轮询队列为空，事件循环将检查已达到时间阈值的定时器。 如果一个或多个定时器准备就绪，则事件循环将回退到定时器阶段以执行这些定时器的回调。

所以，虽然执行setTimeout和setInterval调度的回调函数的阶段是timers阶段，但是从技术上讲是由poll阶段来决定何时执行这些函数的，因为主线程有可能阻塞在poll阶段