# webpack使用与配置

1. `clean-webpack-plugin`的正确使用姿势：
    ```
    const { CleanWebpackPlugin } = require('clean-webpack-plugin');
    ```
    答应我，不会用的去看看文档好吧。。。

2. `optimization`里面的相关配置：
   * 设置`minChunks`指的是有几个`entrypoint`进去形成的`chunk`用到了该`module`，如果达到了该值就会进行分割。
   * `chunks`的参数有`async`（默认，对异步引入的`module`进行分割），`initial`（对同步引入的`module`进行分割），`all`（对所有形式引入的`module`进行分割）

3. `webpack4`中的`production`模式其实已经默认采用了`uglifyjs`

4. 在进行异步引入操作时需要引进新的插件`npm install @babel/plugin-syntax-dynamic-import -D`，并修改`babel`配置：
    ```
    {
        "presets": [["@babel/preset-env", {
            "corejs": 2,
            "useBuiltIns": "usage"
        }]],
        "plugins": ["@babel/plugin-syntax-dynamic-import"]
    }
    ```
5. `magic comments`
    * `webpackChunkname`
    * `webpackPrefetch`: `prefetch chunk` 会在父 `chunk` 加载结束后开始加载。
    * `webpackPreload`: `preload chunk` 会在父 `chunk` 加载时，以并行方式开始加载。

6. `package.json`里面的`scripts`配置：
    ```
    "scripts": {
        "build": "webpack --config ./config/webpack.config.js",
        "dev": "webpack-dev-server --config ./config/webpack.config.js"
    },
    ```

7. 设置`postcss`需要几步操作：
   * `npm install postcss-loader autoprefixer -D`
   * 在根目录下添加`postcss.config.js`，并添加以下代码：
    ```
        module.exports = {
            plugins: [require('autoprefixer')]
        }
    ```
    * 修改`webpack.config.js`里面的配置：
    ```
        {
            test: /\.(sass|scss)$/,
            use: ['style-loader','css-loader','sass-loader','postcss-loader'] // 顺序不能变
        }
    ```

8. 设置`css`模块的模块化：
    * 修改`webpack.config.js`的配置：
    ```
        {
            test: /\.scss$/,
            use: ['style-loader', {
                loader: 'css-loader',
                options: {
                    modules: true
                }
            }, 
            'sass-loader', 'postcss-loader'],
        }
    ```
    * 修改`index.js`里面引入`css`文件的方式：原理其实就是在打包`css`文件的时候修改以下`css`文件里面的类名来防止命名的冲突，如此一来使用时就需要动态的使用类名了
    ```
        import style from './index.scss';
        document.querySelector('.d2').classList.add(style.d2)
    ```
    
9. 配置sourceMap：
    * `source-map`: 最大而全，会生成独立的`map`文件，精确到行和列，打包速度慢
    * `cheap-sourse-map`: 相对于上面这种区别在于映射到行为止，打包速度快一些，也会产生独立的`map`文件
    * `inline-source-map`: 映射文件以 `base64` 格式编码，加在 `bundle` 文件最后，不产生独立的 `map` 文件。加入 `map` 文件后，我们可以明显的看到包体积变大了；
    * `cheap-module-eval-source-map`: 这个一般是开发环境（`dev`）推荐使用，在构建速度报错提醒上做了比较好的均衡。
    * `cheap-module-source-map`: 一般来说，生产环境是不配 `source-map` 的，如果想捕捉线上的代码报错，我们可以用这个
    > `eval`: 打包后的模块都使用 `eval()` 执行，行映射可能不准；不产生独立的 `map` 文件

    > `cheap`: `map` 映射只显示行不显示列，忽略源自 `loader` 的 `source map`

    > `inline`: 映射文件以 `base64` 格式编码，加在 `bundle` 文件最后，不产生独立的 `map` 文件

    > `module`: 增加对 `loader` `source map` 和第三方模块的映射

10. `webpack`可视化打包结果：
    ```
        npm install webpack-bundle-analyzer -D
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
    ```

11. 关于`tree shaking`:
    * 首先`tree shaking`只有在`es6`模块中才会适用，因为`es6`模块是编译时加载的，支持静态分析，而以往的`commonjs`模块则是运行时加载，不能静态分析，也就无法进行`tree shaking`了
    * `import`命令输入的变量都是只读的，因为它的本质是输入接口。也就是说，不允许在加载模块的脚本里面，改写接口。但是如果`import`进来的是一个对象，那么改变属性是可以做到的，但是极力不推荐这么做，因为会影响到其他使用该变量的模块。
    * `export`语句输出的接口，与其对应的值是动态绑定关系，即通过该接口，可以取到模块内部实时的值。
    * `import`语句是应该写在顶层作用域的，（否则会报错）只有这样才可以支持静态分析，但是可以通过`polyfill`的方式来支持在块作用域内使用`import`。
    * 只有在`production`模式下`tree-shaking`才会生效，而且像lodash这样的模块即使使用`import { chunk } from lodash`也是无法生效`tree-shaking`的，要使用相应的`es6`模块，即`lodash-es`。注意：即使使用了`lodash-es`，如果是`lazy-loading`模式，即`import('lodash-es').then()`也是无法`tree-shaking`的，因为此时引入的整个的对象。

12. 关于配置`proxy`的坑：
    ```
        proxy: {
            '/api/ganhuo': {
                target: 'http://gank.io/api',
                changeOrigin: true,
            }
        }
    ```
    一开始是像上面这样写的`proxy`，目标请求地址是`http://gank.io/api/xiandu/categories`，但是在代码中这样`axios.get('/api/ganhuo/xiandu/categories')`请求时会报404错误，原因是什么呢？把`proxy`配置修改成下面这样就可以了：
    ```
        proxy: {
            '/api/ganhuo': {
                target: 'http://gank.io/api',
                changeOrigin: true,
                pathRewrite: {
                    '^/api/ganhuo': ''
                }
            }
        }
    ```
    因为不写`pathRewrite`时，相当于`webpack`认出了`/api/gank`开头的内容，知道需要代理到`http://gank.io/api`，但是问题在于，`webpack`只是简单的把请求的`/api/ganhuo/xiandu/categories`拼接到了`http://gank.io/api`后面，最后请求的目标就是`http://gank.io/api/api/ganhuo/xiandu/categories`，很明显是不对的，所以需要写一个`pathRewrite`

13. 使用`typescript`时需要在根目录下创建一个`tsconfig.js`的文件

14. 关于`.babelrc`的配置
    * 直接在`webpack.config.js`中配置`options`
    * 创建`.babelrc`文件，在该文件中配置
    * 注意二者取其一就行了，当然也可以两者互补，只要两者合并起来能满足配置需求即可

    在`webpack.config.js`中的配置是这样的：
    ```
        {
            test: /\.js$/, // normal 普通的 loader
            use: {
                loader: 'babel-loader',
                options: { // 用babel-loader 需要把 es6 -> es5
                    presets: [
                        '@babel/preset-env',
                        '@babel/preset-react'
                    ],
                    plugins: [
                        ["@babel/plugin-proposal-decorators", { "legacy": true }], // 装饰器语法
                        ["@babel/plugin-proposal-class-properties", { "loose": true }], // 支持 class 语法
                        "@babel/plugin-transform-runtime", // 运行时，支持 promise 或 gen*
                        "@babel/plugin-syntax-dynamic-import", // 支持 import then 语法
                    ]
                }
            },
            include: path.resolve(__dirname, '../src'), // 指定为 src 文件
            exclude: /node_modules/, // 排除 node_modules
        }
    ```
    在`.babelrc`中的配置是这样的：
    ```
        {
            presets: [
                '@babel/preset-env',
                '@babel/preset-react'
                // 使用react必须配置的presets项
            ],
            plugins: [
                ["@babel/plugin-proposal-decorators", { "legacy": true }], // 装饰器语法
                ["@babel/plugin-proposal-class-properties", { "loose": true }], // 支持 class 语法
                "@babel/plugin-transform-runtime", // 运行时，支持 promise 或 gen*
                "@babel/plugin-syntax-dynamic-import", // 支持 import then 语法
            ]
        }
    ```
    终于可以摆脱脚手架了。。。。。*(幼稚的想法)

15. `hash`、`chunkhash`和`contenthash`的配置
    * `hash` 计算是跟整个项目的构建相关，也就是说如果配置的是`hash`，那么只要项目中一个文件发生变化，那么所有的`hash`都会发生变化，这对缓存来说是一种浪费，使用`hash`时所有的`hash`值都是一样的，发生变化时一起变化
    * `chunkhash` 就是解决上面这个问题的，它根据不同的入口文件(`Entry`)进行依赖文件解析、构建对应的 `chunk`，生成对应的哈希值。即一个`chunk`里面修改的内容不会影响到另一个`chunk`，只有自己这个`chunk`的`chunkhash`会发生变化
      * 我们更近一步，`index.js` 和 `index.css` 同为一个 `chunk`（`index.css`是同一个`chunk`里面抽出来的），如果 `index.js` 内容发生变化，但是 `index.css` 没有变化，打包后他们的 `hash` 都发生变化，这对 `css` 文件来说是一种浪费。如何解决这个问题呢？`contenthash` 将根据资源内容创建出唯一 `hash`，也就是说文件内容不变，hash 就不变。

16. `mini-css-extract-plugin`的使用姿势：
    * 先是装包，在`plugins`里面`new`出来一个实例
    ```
        new MiniCssExtractPlugin({
            filename: 'index.[contenthash:8].css'
            // 使用contenthash的好处见上一条
        }),
    ```
    * 修改`rules`里面的配置，现在不是用`style-loader`了，而是要利用`mini-css-extract-plugin`提供的`loader`
    ```
        {
            test: /\.scss$/,
            use: [
                // 这里替换了原来的style-loader
                { 
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        hmr: true,
                        reloadAll: true
                    }
                }, 
                {
                    loader: 'css-loader',
                    options: {
                        modules: true
                    }
                }, 
            'sass-loader', 'postcss-loader'],
        }
    ```
    如果不抽离`css`文件那么所有的`css`样式内容都会在打包后被放在`bundle.js`文件中，造成的结果就是`bundle.js`文件内容过大，如果是一个单页应用的话，需要花更多的时间去下载`bundle.js`，首屏体验就不好，抽离`css`文件的作用应该就是这个，将`css`样式的内容抽离出`css`文件，通过`link`标签引入`index.html`中，这样在下载`css`内容的时候可以继续构建`DOM`树也可以继续下载后面的`bundle.js`，阻塞的只是`DOM`的渲染和`bundle.js`的执行，总体来说是提升了性能的。

17. `optimize-css-assets-webpack-plugin`
    这个插件用于对`css`资源进行压缩，食用方式是在`optimization`里面进行配置
    ```
        const OptimizeCss = require('optimize-css-assets-webpack-plugin')
        const Uglify = require('uglifyjs-webpack-plugin')

        mode: 'production',
        optimization: {
            minimizer: [
                new OptimizeCss(),
                new Uglify(),
            ],
        },
    ```
    注意：虽然`mode`已经设置为`production`，但是使用了`optimize-css-assets-webpack-plugin`插件之后如果不使用`uglifyjs`插件的话`js`文件将无法压缩，展现出来的是和`development`模式是一样的，当然如果设置的是`development`模式的话，即使使用了`uglifyjs`插件也无法压缩。

18. `externals`配置
    譬如通过`<script></script>`标签引入了`jQuery`的`CDN`，此时在文件中使用`$`或者`window.$`都可以直接使用`jQuery`，也不需打包进`bundle.js`，但是如果此时又写了`import $ from 'jquery'`（纯属为了看着顺眼）;的话，`jQuery`又会被打包进`bundle.js`，为了避免这样的情况（不用引入的情况偏偏引入了，又不想打包），可以通过配置`externals`属性来忽略一些不需要打包的内容
    ```
        externals: {
            jquery: '$',
        }
    ```

19. 在处理图片时，有三种情况
    * 在`js`文件中创建`img`，然后添加进`DOM tree`
        ```
            import imgSrc from './a.jpg';
            const image = new Image()
            image.src = imgSrc
        ```
    * 在`css`文件中作为`background`使用
        ```
        {
            backgroung: url('./a.jpg');
            // 此时不需要先引入，是因为css-loader已经做了这一步操作
        }
    * 在`html`文件中直接使用
        ```
            <img src='./a.jpg' />
        ```
        为了将该`src`转化为图片打包后的地址，使用一个`loader`：`html-withimg-loader`
        ```
            {
                test: /\.html$/,
                loader: 'html-withimg-loader'
            }
        ```
    > 注意：在配置`webpack.config.js`时可以像下面这样配置，但是虽然我们只使用了`url-loader`，但是需要同时装包`file-loader`，因为由于`limit`的限制，当图片文件大于`200K`时会使用`file-loader`打包出一个图片文件放在`build`文件夹下，图片大小小于`limit`限制时是以`base64`的形式打包进`bundle.js`文件，也就是说`url-loader`里面可能会使用到`file-loader`，这样做的目的也是为了防止`bundle.js`文件过大，另一个原因是图片过大时编码需要的时间较长，影响打包的速度。但是如果图片较多，会发很多 `http` 请求，会降低页面性能，所以当图片体积较小时 `url-loader` 会将引入的图片编码，转为 `base64` 字符串。再把这串字符打包到文件中，最终只需要引入这个文件就能访问图片了，节省了图片请求。

        ```
            {
                test: /\.(jpg|png|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 200*1024,
                        outputPath: 'img/'
                        // 会在build目录下创建一个img目录
                    }
                }
            },
        ```
1.  关于`publicPath`的配置，这是代码上线后将资源托管在`CDN`服务器上，此时`html`文件中引入各个`bundle.js`文件不再是本地引入，而是要去`CDN`服务器上引入，如果继续写成`./bundle.js`就无法获取到资源，所以就要给所有的引入路径添加上一个公共的路径，譬如说放在`http://www.navyblue.com/`的`CDN`服务器上，那么`publicPath`就设置为`http://www.navyblue.com/`，这时候在`html`引入`bundle.js`的时候就会自动去引入`http://www.navyblue.com/bundle.js`。如果在`output`中配置`publicPath`那么打包出来的所有结果被引入时都会加上公共路径，如果想单独配置，譬如说只给图片加，那么就可以在`url-loader`的`options`里面配置
        ```
            {
                test: /\.(jpg|png|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 200*1024,
                        outputPath: 'img/',
                        // 会在build目录下创建一个img目录
                        publicPath: 'http://www.navyblue.com/'
                    }
                }
            },
        ```

2.  关于`chunk`、`bundle`、`module`的区别：
    * `module`好理解，就是需要被打包的一个个模块
    * `bundle`就是打包出来的一个个`js`文件
    * `chunk`：一个`entrypoint`进去以后，根据各种依赖关系形成一大个`chunk`，如果在打包一个`chunk`的过程中需要分割代码，那么分割完最后得到的一个个包就是`bundle`。

3.  关于`html-webpack-plugin`的使用: 对于多页应用需要new多个`plugin`出来
    ```
        new HtmlWebpackPlugin({
            template: './src/index.html',
            minify: {
                removeAttributeQuotes: true,
            },
            filename: 'home.html',
            // filename是打包结束后输出的html文件名
            chunks: ['main'],
            // chunks是指该html需要引入的js文件，里面的`main`其实就是一个entrypoint，因为一个entrypoint对应的就是一个chunk
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            minify: {
                removeAttributeQuotes: true,
            },
            filename: 'other.html',
            chunks: ['sub'],
        }),
    ```

4.  `resolve`的配置：
    ```
        resolve: { //  解析模块的可选项
            modules: [ // 模块的查找目录
                "node_modules",
                path.resolve(__dirname, "app")
            ],
            extensions: [".js", ".json", ".jsx", ".css"], // 用到的文件的扩展
            alias: { // 模块别名列表
                "module": "new-module"
                // 用到的别名：真正的路径
            },
        },
    ```

5.  `production mode`(生产模式) 可以开箱即用地进行各种优化。 包括压缩，作用域提升，`tree-shaking` 等。

6.  对于`cacheGroups`的配置:
    ```
        splitChunks: {
            chunks: 'all',
            minSize: 50000,
            minChunks: 2,
            // 内部的minChunks可以覆盖这里的minChunks
            cacheGroups: {
                lodash: {
                    name: 'mylodash',
                    test: /[\\/]node_modules[\\/]lodash/,
                    // 选择匹配的模块
                    // 譬如第一个包打包的只有lodash，因为没匹配到react所以不会分割到这个包里
                    minChunks: 1,
                    priority: 10,
                    // 打包会根据priority的大小从大到小打包
                },
                react: {
                    name: 'myreact',
                    test: /[\\/]node_modules[\\/]react/,
                    minChunks: 1,
                    priority: 5,
                },
                vendors: {
                    name: 'myGroups',
                    test: /[\\/]node_modules1[\\/]/,
                    priority: -10,
                    minChunks: 1,
                },
                default: {
                    name: 'default',
                    // 默认有个default配置，但是如果显示写出来又全都没匹配中的话会再次调用一个隐式的default
                    minChunks: 1,
                    priority: -20,
                }
            }
        },
    ```

7.  `@babel/polyfill`
    
`Babel`默认只转换新的`JavaScript`句法（`syntax`），而不转换新的`API`，比如`Iterator`、`Generator`、`Set`、`Map`、`Proxy`、`Reflect`、`Symbol`、`Promise`等全局对象，以及一些定义在全局对象上的方法（比如`Object.assign`）都不会转码。

举例来说，`ES6`在`Array`对象上新增了`Array.from`方法。`Babel`就不会转码这个方法。如果想让这个方法运行，必须使用`@babel-polyfill`，为当前环境提供一个垫片，使得在当前环境下可以执行该方法。

27. 关于`CSS`代码
    
`css-loader`:负责解析 `CSS` 代码，主要是为了处理 `CSS` 中的依赖，例如 `@import` 和 `url()` 等引用外部文件的声明

`style-loader` 会将 `css-loader` 解析的结果转变成 `JS` 代码，运行时动态插入 `style` 标签来让 `CSS` 代码生效。

28. 
