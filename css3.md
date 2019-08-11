# CSS3新特性

## 1. 媒体查询

媒体查询，就在监听屏幕尺寸的变化，在不同尺寸的时候显示不同的样式！在做响应式的网站里面，是必不可少的一环

```
    @media screen and (max-width: 960px) and (min-width: 480px) {
        body {
            background-color: darkgoldenrod;
        }
    }
    @media screen and (max-width: 480px) {
        body {
            background-color: lightgreen;
        }
    }

```

## 2. flex布局

[Flex 布局教程：语法篇](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)
[Flex 布局教程：实例篇](http://www.ruanyifeng.com/blog/2015/07/flex-examples.html)

## 3. rgba( , , , opacity)

opacity  1 => 不透明  0 => 透明


## 4. 文字
* `word-break: normal|break-all|keep-all` (normal:按浏览器默认的换行; break-all:允许在单词内部折断换行; keep-all:只能在半角空格或者连字符的地方换行)
* `word-wrap: normal|break-word` (normal:如果一个单词太长，那就会溢出; break-word:允许折断过长的单词)
* `text-overflow: normal|ellipsis`

## 5. 边框

* `border-redius`
* `border-image`

## 6. 阴影

`box-shadow: none|h-offset v-offset blur spread color |inset|initial|inherit;`

* `h-offset`: 水平偏移
* `v-offset`: 竖直偏移
* `blur`: 模糊半径
* `spread`: 阴影扩展的尺寸
* `inset`: 向内的阴影

## 7. transition


## 8. transform


## 9. 选择器


## 番外

1. 隐藏元素的方式
  
    * `display: none`: 元素在页面上将彻底消失，元素本来占有的空间就会被其他元素占有，也就是说它会导致浏览器的重排和重绘。不会触发其点击事件
    * `visibility: hidden`: 和`display:none`的区别在于，元素在页面消失后，其占据的空间依旧会保留着，所以它只会导致浏览器重绘而不会重排。无法触发其点击事件
    * `opacity:0`: 和visibility:hidden的一个共同点是元素隐藏后依旧占据着空间，但我们都知道，设置透明度为0后，元素只是隐身了，它依旧存在页面中。可以触发点击事件

2. 关于em
   
   ```
    <style>
        .parent {
            font-size: 20px;
        }

        .child {
            font-size: 2em; // 40px
            padding: 2em; // 8opx
        }
    </style>
    <body>
        <div class="parent">
            <div class="child"></div>
        </div>
    </body>
   ```

   从上面可以发现，所谓的继承父级元素的font-size指的是，子级元素的font-size先继承自父级元素，如果单位是em就相对父级元素先计算出子级元素的font-size，然后计算子级元素的其他尺寸，其他尺寸是相对计算出的子级元素的font-size来计算的
