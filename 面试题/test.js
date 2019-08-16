let arr = [1, 2, 3];
const handler = {
    get (target, key, receiver) {
        console.log('get key--->', key)
        return Reflect.get(target, key, receiver)
    },
    set (target, key, value, receiver) {
        console.log('set key--->', key)
        return Reflect.set(target, key, value, receiver)
    }
}
let proxy = new Proxy(arr, handler)
proxy.push(100)

// let obj = {
//     a: 1,
//     info: {
//         name: 'eason',
//         blogs: ['webpack', 'babel', 'cache']
//     }
// }
// let handler = {
//     get (target, key, receiver) {
//         console.log('get', key)
//         // 递归创建并返回
//         if (typeof target[key] === 'object' && target[key] !== null) {
//             return new Proxy(target[key], handler)
//         }
//         return Reflect.get(target, key, receiver)
//     },
//     set (target, key, value, receiver) {
//         console.log('set', key, value)
//         return Reflect.set(target, key, value, receiver)
//     }
// }
// let proxy = new Proxy(obj, handler)// 相当于objPro.c = objPro.c + 1,一次get一次set
// // get a
// // set a 2
// proxy.a++;
// proxy.info.name = 'Zoe'
// proxy.info.blogs.push('proxy')


// let obj = {
//     a: 100
// }

// let handler = {
//     get (target, key, receiver) {
//         console.log('get', key)
//         return Reflect.get(target, key, receiver)
//     },
//     set (target, key, value, receiver) {
//         console.log('set', key, value)
//         return Reflect.set(target, key, value, receiver)
//     }
// }

// let p = new Proxy(obj, handler)

// p.a++;

// var person = {
//     name: "张三"
//   };

//   const handler = {
//     get: function(target, property) {
//       if (property in target) {
//         return target[property];
//       } else {
//         throw new ReferenceError("Property \"" + property + "\" does not exist.");
//       }
//     }
//   }
  
//   var proxy = new Proxy(person, handler);
  
//   proxy.name // "张三"