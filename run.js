const arr = [
    next => {
        setTimeout(() => {
            console.log('func1');
            next();
        }, 1000)
    },
    next => {
        setTimeout(() => {
            console.log('func2');
            next();
        }, 1000)
    },
    next => {
        setTimeout(() => {
            console.log('func3');
            next();
        }, 1000)
    }
]

// done函数作为一个计数器

const run = arr => {
    if(arr.length === 0) {
        return
    }
    let count = 0;
    function done() {
        if(++count === arr.length) {
            return;
        }
        arr[count](done)
    }
    arr[0](done)
}

// run(arr)


// 利用promise
const run2 = arr => {
    // let count = 0;
    function dispath(i) {
        if(i === arr.length) return;
        new Promise(res => arr[i](res)).then(() => dispath(i + 1))
    }
    dispath(0)
}

// run2(arr)


// 递归调用

const run3 = arr => {
    arr[0](() => run(arr.slice(1)));
}

// run3(arr)

const interval = (fn, wait) => {
    let timer;
    const next = () => {
        if(timer) {
            clearTimeout(timer);
        }
        fn();
        timer = setTimeout(() => {
            next()
        }, wait)
    }

    next()
}

let fn = () => console.log('hahah')

interval(fn, 1000)