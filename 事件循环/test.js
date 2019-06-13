// const fs = require('fs');


// console.log('start')
// let start = Date.now()
// setTimeout(() => {
//     console.log('timeout')
// }, 2000)
// // setTimeout(function(){
// //     console.log('setTimeout');
// // },3000);
// // setTimeout(function(){
// //     console.log('setTimeout1111');
// // },3000);
// // setImmediate(() => {
// //     console.log('immediate****************')
// // })
// // setTimeout(() => {
// //     console.log('&&&&&&&&&&&')
// // }, 0);
// fs.readFile('./file.txt', (err, data) => {
//     console.log('start reading1')
//     while(Date.now() - start < 2100) {

//     }
//     console.log('finished reading1')
//     // console.log(data.toString())
// })

// fs.readFile('./file.txt', (err, data) => {
//     console.log('start reading2')
//     while(Date.now() - start < 4000) {

//     }
//     console.log('finished reading2')
//     // console.log(data.toString())
// })

// // while(Date.now() - start < 4000) {

// // }

// async function async1() {
//     console.log('async1');
//     await async2();
//     console.log('async1 end');
// }

// async function async2() {
//     console.log('async2');
// }

// console.log('script start');

// async1();

// new Promise((res) => {
//     console.log('Promise')
//     res()
// }).then(() => {
//     console.log('then')
// }).then(() => {
//     console.log('then1')
// }).then(() => {
//     console.log('then2')
// }).then(() => {
//     console.log('then3')
// }).then(() => {
//     console.log('then4')
// })
// console.log('sync end')

// // start
// // script start
// // async1
// // async2
// // Promise
// // sync end
// // then
// // then1
// // async1 end
// // then2
// // then3
// // then4
// // timeout
// // setTimeout


var fs = require('fs');
setImmediate(() => {
    console.log('setImmediate222')
})
setImmediate(() => {
    console.log('setImmediate333')
})
fs.readFile('./file.txt', () => {
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

    
    process.nextTick(()=>{
        console.log('nextTick1');
    })
    process.nextTick(()=>{
        console.log('nextTick2');
    })
});
console.log('start')
let start = Date.now()
while(Date.now() - start < 2000) {
    
}