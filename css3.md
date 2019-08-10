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

