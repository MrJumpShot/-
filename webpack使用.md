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

14. 关于.babelrc的配置
    * 直接在webpack.config.js中配置options
    * 创建.babelrc文件，在该文件中配置
    * 注意二者取其一就行了，当然也可以两者互补，只要两者合并起来能满足配置需求即可

    在webpack.config.js中的配置是这样的：
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
    在.babelrc中的配置是这样的：
    ```
        {
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
    ```