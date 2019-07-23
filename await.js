async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}
async function async2() {
    console.log('async2');
}
console.log('script start');
setTimeout(function() {
    console.log('setTimeout');
}, 0)
async1();
new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
}).then(function() {
    console.log('promise3');
}).then(function() {
    console.log('promise4');
});
console.log('script end');


// node执行结果如下

// script start
// async1 start
// async2 
// promise1
// script end  主要区别在于这行和下一行，具体差异的原因在于node会吧await后面的微任务多次放进微任务队列中
// promise2
// promise3
// async1 end
// promise 4
// setTimeout

// 浏览器执行结果如下

// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// promise3
// promise4
// setTimeout