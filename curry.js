function sum(...args) {
    let ans = 0;
    for(let i of args) {
        ans += i;
    }
    return ans;
}

const curry = fn => {
    let args = [];
    return function next(...args1) {
        if(args1.length === 0) {
            return fn.apply(null, args);
        }
        args = [...args, ...args1];
        return next;
    }
}


let curry_sum = curry(sum)

console.log(curry_sum(1)(2)(3, 4)(5)(6, 7, 8)())



