// function sum(...args) {
//     let ans = 0;
//     for(let i of args) {
//         ans += i;
//     }
//     return ans;
// }

// const curry = fn => {
//     let args = [];
//     return function next(...args1) {
//         if(args1.length === 0) {
//             return fn.apply(null, args);
//         }
//         args = [...args, ...args1];
//         return next;
//     }
// }


// let curry_sum = curry(sum)

// console.log(curry_sum(1)(2)(3, 4)(5)(6, 7, 8)())



let sum=function () {
    var total = 0;
    for (let i = 0, c; c = arguments[i++];) {
        total += c;
    }
    return total;
};

let curry = (fn) => {
    let args = [];

    // 不用callee这个属性，而是直接使用函数名字来调用
    return function next() {
        if(arguments.length === 0) {
            return fn.apply(this, args);
        }
        // curry化之后的函数使用方式是，不断收集参数，认为参数收集完毕之后就进行一次无参调用进行最后的计算。
        // 所以curry化在这里的作用其实就是收集参数，当然不同的curry函数可以达到不同的效果
        args = [...args, ...arguments];
        // return arguments.callee;
        return next;
    }
}


let sum_curry1 = curry(sum);
sum_curry1(1)(2,3);
sum_curry1(4);
sum_curry1(4);
console.log(sum_curry1());