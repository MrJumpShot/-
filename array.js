let arr1 = [1, 2, [3, [4, [5, 6, 7, 'haha', 8]], [9, 10, [11, 12]]]]

// 递归实现数组的扁平化， 通用的函数
const fn1 = (arr) => {
    let temp = [];
    for(let item of arr) {
        if(item instanceof Array) {
            temp = [...temp, ...(fn1(item))];
        } else {
            temp.push(item)
        }
    }
    return temp;
}


// console.log(fn1(arr1))

const fn2 = (arr) => {
    let str = arr.toString();
    return str.split(',')
}

// console.log(fn2(arr1))

// [ '1', '2', '3', '4', '5', '6', '7', 'haha', '8', '9', '10', '11', '12' ]
// 可以看出来这种方法的缺陷在于把所有的元素都变成string了


const fn3 = (arr) => {
    return arr.reduce((previous, current) => {
        return previous.concat(Array.isArray(current) ? fn3(current) : current)
    }, []);
}

// console.log(fn3(arr1))


const fn4 = (arr) => {
    while(arr.some(item => Array.isArray(item))) {
        arr = [].concat(...arr); // 这里其实相当于给concat传了多个参数，如果是数组的参数就解构
    }
    return arr;
}

