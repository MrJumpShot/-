const arr = [
    next => {
        setTimeout(() => {
            console.log('func1');
            next();
        }, 3000)
    },
    next => {
        setTimeout(() => {
            console.log('func2');
            next();
        }, 3000)
    },
    next => {
        setTimeout(() => {
            console.log('func3');
            next();
        }, 3000)
    }
]

const run = arr => {
    if(arr.length === 0) {
        return;
    }

    arr[0](() => run(arr.slice(1)));
}

// run(arr)

const run1 = arr => {
    function dispatch(i) {
        if(i === arr.length) {
            return;
        }
        new Promise(res => {
            arr[i](res)
        }).then(() => dispatch(i + 1))
    }

    dispatch(0)
}

run1(arr)