# 手撸一个Promise

```
    // let p = new Promise((res, rej) => {
    // 	rej("error")
    // })

    // let p1 = p.then((data) => {
    // 	console.log("ok", data)
    // }, (err) => {
    // 	console.log("err", err) // 若此处发生错误 如 console.log("err", err1) 则会发生reject  否则p1都将resolve
    // })

    // p1.then((data) => {
    // 	console.log("deal")
    // }, (err) => {
    // 	console.log("error")
    // })

    // function F() {

    // }

    // F.prototype.f1 = function() {
    // 	console.log(this.a)
    // }

    // let f = new F()
    // f.a = 100
    // f.f1()
    // 
    function MyPromise(executor) {
        let self = this;
        self.status = "pending";
        self.data = undefined;
        self.onResolvedCallbacks = [];
        self.onRejectedCallbacks = [];

        function resolve(value) {
            // 此处把执行函数包裹在setTimeout里面的原因在于防止后续的then方法内的回调还没有添加到回调队列中而得不到执行，
            // 放在setTimeout里面之后就会先去添加回调，执行完添加回调这样的同步操作之后才会执行setTimeout里面的异步回调
            setTimeout(function() {
                if(self.status === "pending") {
                    self.status = "resolved";
                    self.data = value;
                    for(let i = 0; i < self.onResolvedCallbacks.length; i++) {
                        self.onResolvedCallbacks[i](value);
                    }
                }
            }, 0)
        }

        function reject(reason) {
            setTimeout(function() {
                if(self.status === "pending") {
                    self.status = "rejected";
                    self.data = reason;
                    for(let i = 0; i < self.onRejectedCallbacks.length; i++) {
                        self.onRejectedCallbacks[i](reason);
                    }
                }
            }, 0)
        }

        try{
            executor(resolve, reject);
        } catch(e) {
            reject(e);
        }
    }

    MyPromise.prototype.then = function(onResolved, onRejected) {
        let self = this;
        onResolved = typeof onResolved === "function" ? onResolved : (value) => value;
        onRejected = typeof onRejected === "function" ? onRejected : (reason) => reason;

        if(self.status === "resolved") {
            return new MyPromise((resolve, reject) => {
            // 下面这里写的有问题，不应该是把回调推进数组，而是应该直接调用，推进数组的话就不会执行了
            // 应该改成这样
            // if (self.status === "resolved") {
            //    return new MyPromise((resolve, reject) => {
            //        setTimeout(function () {
            //            try {
            //                let x = onResolved(self.data);
            //                if (x instanceof MyPromise) {
            //                    x.then(resolve, reject);
            //                } else {
            //                    resolve(x);
            //                }
            //            } catch (e) {
            //                reject(e);
            //            }
            //        })
            //    })
            // }
                self.onResolvedCallbacks.push(function(value) {
                    try{
                        let x = onResolved(self.data);
                        if(x instanceof MyPromise) {
                            x.then(resolve, reject);
                        } else {
                            resolve(x);
                        }
                    } catch(e) {
                        reject(e);
                    }
                })
            })
        }

        if(self.status === "rejected") {
            return new MyPromise((resolve, reject) => {
                self.onRejectedCallbacks.push(function (reason) {
                    try{
                        let x = onRejected(self.data);
                        if(x instanceof MyPromise) {
                            x.then(resolve, reject);
                        } else {
                            resolve(x);
                        }
                    } catch(e) {
                        reject(e);
                    }
                })
            })
        }

        if(self.status === "pending") {
            return new MyPromise((resolve, reject) => {
                self.onResolvedCallbacks.push(function(value) {
                    try{
                        let x = onResolved(x);
                        if(x instanceof MyPromise) {
                            x.then(resolve, reject);
                        } else {
                            resolve(x);
                        }
                    } catch(e) {
                        reject(e);
                    }
                })

                self.onRejectedCallbacks.push(function(reason) {
                    try{
                        let x = onRejected(x);
                        if(x instanceof MyPromise) {
                            x.then(resolve, reject);
                        } else {
                            resolve(x);
                        }
                    } catch(e) {
                        reject(e);
                    }
                })
            })
        }
    }

    MyPromise.prototype.catch = function(onCatch) {
        MyPromise.prototype.then(undefined, onCatch);
    }
    
    MyPromise.all = function(promises) {
        function gen(times, cb) {
            let result = [];
            let count = 0;
            return function(i, data) {
                result[i] = data;
                if(++count === times) {
                    cb(result)
                }
            }
        }
        
        return new MyPromise(function(res, rej) {
            let done = gen(promises.length, res);
            for(let i = 0; i < promises.length; i++)
                promises[i].then(data => done(i, data), rej)
            })
    }


    let p = new MyPromise((res, rej) => {
        setTimeout(() => {
            res(100);
        })
    })

    let p1 = p.then((data) => {
        console.log(data);
    })

    let p2 = p.then((data) => {
        console.log(data);
    })

    console.log(p1 == p2);
```
