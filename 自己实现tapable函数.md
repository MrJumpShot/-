# tapable函数

> tapable库是webpack实现插件机制的底层依赖

主要实现以下这些函数：
1. SyncHook：同步执行的钩子
2. SyncBailHook：同步执行，前一步返回是null才会进入下一个函数，否则直接结束
3. SyncWaterfallHook：同步执行，前一个函数的执行结果作为下一个函数的参数传入
4. SyncLoopHook：同步执行每个函数，若某个函数返回不为undefined则继续循环执行该函数，直至该函数返回undefined再进入下一个函数
5. AsyncParallelHook：异步并行执行，知道所有异步函数执行结束再进入最后的finalCallback
6. AsyncParallelBailHook：异步并行执行，只要监听函数的返回值不为 null，就会忽略后面的监听函数执行，直接跳跃到callAsync等触发函数绑定的回调函数，然后执行这个被绑定的回调函数
7. AsyncSeriesHook：异步串行执行，函数参数都来自于最初传入的参数
8. AsyncSeriesBailHook：异步串行执行，只要监听函数的返回值不为 null，就会忽略后面的监听函数执行，直接跳跃到callAsync等触发函数绑定的回调函数，然后执行这个被绑定的回调函数
9. AsyncSeriesWaterfallHook：异步串行执行，上一个监听函数的中的callback(err, data)的第二个参数,可以作为下一个监听函数的参数


## 自己实现
1. syncHook:同步执行的钩子
   ```
    class syncHook {
        constructor() {
            this.tasks = [];
        }

        tap(name, task) {
            this.tasks.push(task);
        }

        call(...args) {
            this.tasks.forEach(task => task(...args))
        }
    }
   ```

2. syncNailHook:同步执行，前一步返回是null才会进入下一个函数，否则直接结束
   ```
    class syncBailHook {
        constructor() {
            this.tasks = [];
        }

        tap(name, task) {
            this.tasks.push(task);
        }

        call(...args) {
            let ret;
            let index = 0;
            do {
                ret = this.tasks[index++](...args)
            } while(ret === undefined && index < this.tasks.length)
        }
    }
   ```

3. SyncWaterfallHook：同步执行，前一个函数的执行结果作为下一个函数的参数传入
   ```
    class SyncWaterfallHook {
        constructor() {
            this.tasks = [];
        }

        tap(name, task) {
            this.tasks.push(task);
        }

        call(...args) {
            let [first, ...others] = this.tasks;
            let ret = first(...args);
            others.reduce((a, b) => {
                return b(a)
            }, ret)
        }
    }
   ```


4. SyncLoopHook：同步执行每个函数，若某个函数返回不为undefined则继续循环执行该函数，直至该函数返回undefined再进入下一个函数
   ```
    class SyncLoopHook {
        constructor() {
            this.tasks = [];
        }

        tap(name, task) {
            this.tasks.push(task);
        }

        call(...args) {
            this.tasks.forEach(task => {
                let ret;
                do {
                    ret = task(...args)
                } while(ret !== undefined)
            })
        }
    }
   ```

5. AsyncParallelHook：异步并行执行，知道所有异步函数执行结束再进入最后的finalCallback
   ```
    class AsyncParallelHook {
        constructor() {
            this.tasks = [];
        }

        tap(name, task) {
            this.tasks.push(task);
        }

        call(...args, finalCb) {
            let count = 0;
            const len = this.tasks.length;
            const done = () => {
                count++;
                if(count === len) {
                    finalCb()
                }
            }
            this.tasks.forEach(task => {
                task(...args, done)
                
            })

        }
    }
   ```

6. AsyncSeriesHook：异步串行执行，函数参数都来自于最初传入的参数
   ```
    class AsyncSeriesHook {
        constructor() {
            this.tasks = [];
        }

        tap(name, task) {
            this.tasks.push(task);
        }

        call(...args, finalCb) {
            let count = 0;
            const len = this.tasks.length;
            const next = () => {
                if(count === len) {
                    return finalCb()
                }
                this.tasks[count++](...args, next)
            }
            next()

        }
    }
   ```

7. AsyncSeriesWaterfallHook：异步串行执行，上一个监听函数的中的callback(err, data)的第二个参数,可以作为下一个监听函数的参数
   ```
    class AsyncSeriesWaterfallHook {
        constructor() {
            this.tasks = [];
        }

        tap(name, task) {
            this.tasks.push(task);
        }

        call(...args, finalCb) {
            let count = 0;
            const len = this.tasks.length;
            const next = (err, data) => {
                if(count === len) return finalCb()
                let task = this.tasks[count];
                if (count === 0) {
                    task(...args, next);
                } else {
                    task(data, next);
                }
                count++;
            };
            next()

        }
    }
   ```