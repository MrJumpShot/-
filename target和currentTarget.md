# target和currentTarget

> target指的是触发事件的元素，currentTarget是指监听事件的元素

上面这句话看起来不知道怎么理解，看个例子就明白了

```
    <!DOCTYPE html>
        <html>
            <head>
                <title>Example</title>
            </head>
            <body>
                <div id="A">
                    <div id="B"></div>
                </div>
            </body>
            <script>
                var a = document.getElementById('A'),
                b = document.getElementById('B');    
                function handler (e) {
                    console.log(e.target);
                    console.log(e.currentTarget);
                }
                a.addEventListener('click', handler, false);
                // 上面代码中的false意思是在冒泡阶段触发函数，如果置为true就是指在捕获阶段触发函数。
                // 想要在捕获阶段和冒泡阶段都触发函数的话就要绑定两次
                // 默认值为false，也就是在冒泡阶段触发
            </script>
        </html>
```
1. 当点击A时，输出的内容为
   ```
    <div id="A">...<div>  // target
    <div id="A">...<div>  // currentTarget
   ```

2. 当点击B时，输出的内容为
   ```
    <div id="B">...<div>  // target
    <div id="A">...<div>  // currentTarget
   ```

    因为handler函数时绑定在A上的，所以执行该函数的时候说明事件都已经到了A元素上，所以currentTarget都是A，但是对于target来说，同时看是谁触发的事件，那就是点击哪个元素，target就是哪个元素了

    所以如果B上面绑定handler函数的话，那么currentTarget打印出来的都是B元素了，但是实际上currentTarget是一直在变化的，随着时间捕获和冒泡在一直变化中


### 下面来看看捕获和冒泡阶段都触发函数是怎么样的

```
    b.addEventListener('click', handler, true); // 捕获阶段
    a.addEventListener('click', handler, true);
    b.addEventListener('click', handler, false); // 冒泡阶段
    a.addEventListener('click', handler, false);
    // 在A和B上面都绑定两次handler，这样就可以在捕获和冒泡阶段都触发函数了
```

点击B的话输出的结果如下：

```
    // 捕获是从外层往内层捕获的，从html开始，先到了外层A元素上
    <div id="B">...<div> target
    <div id="A">...<div> currentTarget
    // 捕获到了B元素，实际上已经到了目标阶段
    <div id="B">...<div> target
    <div id="B">...<div> currentTarget
    // 开始冒泡，从B元素开始，实际上还是在目标阶段
    // 所以目标阶段是从A->B然后从B->A
    <div id="B">...<div> target
    <div id="B">...<div> currentTarget
    // 冒泡到了A元素
    <div id="B">...<div> target
    <div id="A">...<div> currentTarget
```


## 番外

对于DOM元素绑定事件的方法有多种，绑定的函数也有普通函数和箭头函数之分，对于不同函数的this需要注意指向

1. 直接绑定
   ```
    <div onclick="console.log(this)">click me</div>
    // 点击之后打印出来的是 <div onclick="console.log(this)">click me</div>
    // 说明此时的this指向的就是当前的DOM元素
   ```

   此处又回想起来关于html标签里面属性的大小写问题，浏览器是不区分属性的大小写的，一律会把字母变成小写的

2. 利用onclick来绑定
   
   该方法的缺陷在于只能绑定一个函数，如果多次绑定的话后面绑定的函数会覆盖前面绑定的函数

   其次该方法绑定的函数默认是在冒泡阶段触发，无法改变

   ```
    var a = document.getElementById('A')；
    a.onclick = function() {
        console.log(this)
    }

    // 打印出的结果为  <div id="A">...<div>
   ```
    如果绑定的是箭头函数
    ```
    var a = document.getElementById('A')；
    a.onclick = function() {
        console.log(this)
    }

    // 打印出的结果为  window{}
   ```

3. 利用addEventListener来绑定
   

   ```
    var a = document.getElementById('A');
    function fn() {
        console.log(this)
    }
    a.addEventListener(fn)

    // 打印出的结果为  <div id="A">...<div>
   ```
    如果绑定的是箭头函数
    ```
    var a = document.getElementById('A');
    a.onclick = function() {
        console.log(this)
    }

    // 打印出的结果为  window{}
   ```

### 关于事件传播的阶段

W3C标准事件模型中，事件传播是有三个阶段的，但是在IE中只有目标阶段和冒泡阶段，所以如果需要兼容IE的话一般会把事件处理放在冒泡阶段进行

1. 第一阶段：从window对象传导到目标节点（上层传到底层），称为“捕获阶段”（capture phase）
2. 第二阶段：在目标节点上触发，称为“目标阶段”（target phase）
3. 第三阶段：从目标节点传导回window对象（从底层传回上层），称为“冒泡阶段”（bubbling phase）

```
    <div id="A">
        <p id="B"></p>
    </div>

    // 点击以后的结果
    // Tag: 'DIV'. EventPhase: 'capture'
    // Tag: 'P'. EventPhase: 'target'
    // Tag: 'P'. EventPhase: 'target'
    // Tag: 'DIV'. EventPhase: 'bubble'
```

上述代码点击B时
1. 捕获阶段：事件从`<div>`向`<p>`传播时，触发`<div>`的click事件
2. 目标阶段：事件从`<div>`到达`<p>`时，触发`<p>`的click事件（在目标阶段会触发两次）
3. 冒泡阶段：事件从`<p>`传回`<div>`时，再次触发`<div>`的click事件

### 事件委托（事件代理）

利用事件冒泡机制，又父级元素来代理子元素的各种事件

作用：
1. 如果有大量的节点需要绑定事件的话，需要一个个DOM元素取出来进行绑定，造成性能问题
2. 如果有动态添加的子元素，需要手动再进行事件绑定，很不灵活


