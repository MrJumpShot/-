# 关于CSS阻塞问题

> CSS加载过程中会阻塞DOM树的渲染以及在该CSS文件后面的JS代码的执行，但是不会阻塞后面DOM树的构建过程

```
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>css阻塞</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            h1 {
                color: red !important
            }
        </style>
        <script>
            function h () {
                console.log(document.querySelectorAll('h1'))
            }
            setTimeout(h, 0)
            
        </script>
        <link href="https://cdn.bootcss.com/bootstrap/4.0.0-alpha.6/css/bootstrap.css" rel="stylesheet">
    </head>
    <body>
        <h1>这是红色的</h1>
    </body>
    <script>
        console.log('hahahah')
    </script>
    </html>
```

在执行上述代码之前先将network限制在10Kb的速度，让CSS的加载时间足够长。

我们发现很快打印出了一个NodeList，里面有`<h1></h1>`，虽然此时屏幕上还没有内容，CSS资源也还没加载完。说明CSS资源的加载不会阻塞后面DOM的构建（DOM解析和CSS解析是并行的），但是屏幕是没有东西的，说明CSS资源的加载会阻塞DOM的渲染，只有加载完了之后才会渲染。

因为加载css的时候，可能会修改下面DOM节点的样式，如果css加载不阻塞DOM树渲染的话，那么当css加载完之后，DOM树可能又得重新重绘或者回流了，这就造成了一些没有必要的损耗。所以就先把DOM树的结构先解析完，把可以做的工作做完，然后等css加载完之后，在根据最终的样式来渲染DOM树，这种做法性能方面确实会比较好一点

而且当CSS资源加载完之后console里面才打印出‘hahahah’，说明CSS资源的加载会阻塞后面的JS代码的执行，原因在于后面的JS代码可能会修改CSS样式，（但是不会阻止后面的JS资源的下载，也就是说浏览器在加载CSS资源的同时会继续解析DOM，看到有其他的CSS资源或者JS资源需要下载的话会并行下载）


## 提高性能

1. 使用CDN(因为CDN会根据你的网络状况，替你挑选最近的一个具有缓存内容的节点为你提供资源，因此可以减少加载时间)
2. 对css进行压缩(可以用很多打包工具，比如webpack,gulp等，也可以通过开启gzip压缩)
3. 合理的使用缓存(设置cache-control,expires,以及E-tag都是不错的，不过要注意一个问题，就是文件更新后，你要避免缓存而带来的影响。其中一个解决防范是在文件名字后面加一个版本号)