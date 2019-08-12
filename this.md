# 关于this

## 箭头函数的this

1. 箭头函数的this是固定的，不会变化，总是指向箭头函数定义时所在的对象，而不是执行时所在的对象，这样就导致call和apply等没有效果（其实是箭头函数自己压根没有this，何来的绑定）

    > this指向的固定化，并不是因为箭头函数内部有绑定this的机制，实际原因是箭头函数根本没有自己的this，导致内部的this就是外层代码块的this。正是因为它没有this，所以也就不能用作构造函数。

    ```
        function foo() {
            setTimeout(() => {
                console.log('id:', this.id);
            }, 100);
        }

        var id = 21;

        foo.call({ id: 42 });  // 42
        // 箭头函数在call的时候就定义了，此时的上下文环境是{id: 42}
        // 虽然最终执行的上下文是window，但是this的指向并不会发生变化

    ```

    对于普通函数，this是指向执行时所属的执行上下文环境的

    ```
        function foo() {
            setTimeout(function() {
                console.log('id:', this.id);
            }, 100);
        }

        var id = 21;

        foo.call({ id: 42 });  // 21
        // 普通函数的this指向的是执行的时候的上下文环境，所以打印出来的是21
    ```

    注意：箭头函数不适合做对象的属性，因为此时箭头函数里面的this指向的是全局对象window

    ```
        const cat = {
            lives: 9,
            jumps: () => {
                this.lives--;
            }
        }

        // 此时执行cat.jumps()的话是window.lives--

    ```

    原因是箭头函数虽然是对象的属性，但是定义该箭头函数时是在全局的上下文环境，对象不是一个作用域，所以定义时的this就指向全局对象

    或者这样解释，定义cat的时候，cat是没有this的，所以在定义里面的箭头函数的时候this自然就指向了全局对象

2. 箭头函数作为回调函数

    ```
        var handler = {
            id: '123456',

            init: function() {
                document.addEventListener('click',
                event => this.doSomething(event.type), false);
            },

            doSomething: function(type) {
                console.log('Handling ' + type  + ' for ' + this.id);
            }
        };

        handler.init()
        // 执行init后点击document可以正确打印出id
        // 因为箭头函数定义的时机是执行init的时候，这时候绑定的回调，而此时执行上下文环境是handler对象，所以导致箭头函数的this就指向了handler
        // 也可以这么理解，绑定回调是执行init的时候，这时候init的this是指向handler的，所以箭头函数的this也就借用了init的this，从而指向了handler
    ```
    如果把回调函数改成普通函数就会打印出undefined，因为回调函数的this绑定了document

3. 箭头函数不能使用new命令(箭头函数没有自己的this应该是造成它不能作为构造函数的一个原因)

    ```
        const C = () => {
            this.a = 100;
        }
        new C();
        // Uncaught TypeError: C is not a constructor
    ```

4. 箭头函数内部不能使用yield命令

5. 嵌套的箭头函数

    ```
        function foo() {
            return () => {
                return () => {
                    return () => {
                        console.log('id:', this.id);
                        // 所有的箭头函数都没有自己的this，指向的都是foo函数的this
                    };
                };
            };
        }
        // 其实内部的箭头函数并不是一开始就定义的，而是执行外层函数的时候才定义了箭头函数，这时候外层的foo已经绑定好了this

        var f = foo.call({id: 1});

        var t1 = f.call({id: 2})()(); // id: 1
        var t2 = f().call({id: 3})(); // id: 1
        var t3 = f()().call({id: 4}); // id: 1
    ```


## 普通函数的this

> 简而言之，普通函数的this是和执行函数时的执行上下文环境绑定的

1. 全局环境下调用函数，this指向全局对象，strict模式下指向undefined

    ```
        var a = 100;
        function fn() {
            console.log(this.a);
        }
        fn() // 100
        // 执行fn时是全局作用域，此时的this就是全局执行上下文环境window
    ```

2. 对象调用方法时，this指向调用的对象

3. 对象的方法赋值给一个全局变量，然后执行该全局变量的时候，this指向全局对象

4. A对象的方法f赋值个B对象，执行B.f，f的this执行B

5. 嵌套函数内层函数的this指向全局对象

6. DOM的事件回调函数的this指向DOM元素