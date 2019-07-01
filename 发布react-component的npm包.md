# 如何发布一个react-component到npm上

菜鸟最近在项目上被要求将自己写的一个`react`组件发布到`npm`上，网上找了些资料尝试都失败了，考虑是不是因为项目是`create-react-app`起的导致`publish`的时候有问题，经过一通瞎搞最后也算是`publish`成功了，来分享一下发布的方法。


1. 如果项目是由`create-react-app`创建的话，可以直接在构建的项目中发布。

    具体的方法其实就是从自己组件的入口文件开始对组件进行编译，编译成低版本的js语言，采用的工具当然是babel。

    这种方式的缺点在于需要自己去维护babel相关的依赖，具体的方法是首先添加.babelrc文件，在该文件下添加内容
    
```
    {
        "presets": [["@babel/preset-env"], ["@babel/preset-react"]],
        "plugins": ["@babel/plugin-proposal-class-properties"]
    }
```
    所以在这里首先需要安装一些babel相关的包
```
    yarn add -D @babel/core @babel/cli @babel/preset-env @babel/preset-react
    // 注意，包一定要装全，不然肯定报错
```
    其中plugins里面的东西是为了支持一些babel还未支持的语法，其次在package.json文件中做一些修改，下面只列出做出修改的部分
```
    {
        // ....
        "private": false,
        "main": "lib/index.js",
        // main字段指的是publish的组件的入口文件
        // 先对项目执行yarn compile的命令得到编译后的lib文件夹，然后再针对打包后的文件进行publish
        // files字段指的是自己需要publish的文件或者文件夹
        "files": [
            "lib"
        ],
        "scripts": {
            "compile":  "NODE_ENV=production babel src --out-dir lib --copy-files --ignore __tests__,spec.js,test.js,__snapshots__"
        }
        // 添加compile字段来对编译组件，指定入口文件和输出的目录，注意一定要copy files不然会缺少某些文件
    }
```
    
    
2. 使用nwb起项目
   
我们发现上面针对`create-react-app`起的项目发布组件很复杂而且难以维护，官方推荐的是使用nwb来起一个组件的项目，发布就很简单了。

具体方法：

直接全局安装`nwb`，然后`nwb new react-component react-hello`来起一个项目，然后直接进项目然后`yarn build`就构建出来可以发布的内容了，包括`es` `umd`，然后执行`npm publish`就可以了

可以说是肥肠方便了，`nwb`起的项目里面还有一个`demo`文件夹，可以在里面直接引用你自己写的组件，来看组件实现的效果，棒。。。