# webpack打包结果分析

> 对于Object.defineProperty的理解  
> Object.defineProperty(obj, prop, descriptor)  
> 注意：当使用了getter或setter方法，不允许使用writable和value这两个属性  
>
    Object.defineProperty(obj,"newKey",{
        configurable:true | false, // 默认为false
        enumerable:true | false,  // 默认为false
        value:任意类型的值,  // 默认为undefined
        writable:true | false  // 默认为false
    });

---
> 可以看到，整个打包生成的代码是一个IIFE(立即执行函数)，函数内容我们待会看，我们先来分析函数的参数。
> webpack在打包的时候把所有的模块依赖通过ast抽象语法树的解析以及一些替换的操作得到这些模块的改写模式，所谓改写模式就是原来模块中可能采用了一些require或者import的语法，这些语法浏览器是无法识别的，webpack就自己实现了一个__webpack_require__方法，并且把原有模块中那些不认识的导入方法改成这个方法，转换完这些模块后依次放进modules对象里面，这就作为IIFE的参数。
> 在执行IIFE函数的时候，设置了一个缓存模块exports的对象，叫做installedModules，里面的key对应于各个模块的路径，value对应于各个模块的exports对象，由于ast解析修改之后各个模块并未执行，所以尚且不知道这些模块的exports对象。在执行IIFE时如果发现installedModules缓存池中没有当前对象时，就给该对象赋初始值 {i: moduleId, l: false, exports: {}}，再用modules对象里面取出的模块函数去call这个初始对象里面的内容，得到相应的exports，后续再用到这个模块的时候只需要从缓存池中直接取就可以了。
> 函数参数是我们写的各个模块组成的key-value对象，只不过我们的代码，被webpack包装在了一个函数的内部，也就是说我们的模块，在这里就是一个函数。为什么要这样做，是因为浏览器本身不支持模块化，那么webpack就用函数作用域来hack模块化的效果

    (function(modules) { // webpackBootstrap
                     // The module cache


        //  已加载的 module 缓存池
        //  缓存池的作用是什么？modules里面不是已经有了所有依赖的模块了吗？
        //  是因为modules数组里面只是初步解析的源码，没有进行不同标准模块的统一化？
        //  而在缓存池中的模块都是经过__webpack_require__处理的模块，统一将输出挂载在module.exports上
        var installedModules = {};

        // 自定义的require 函数
        function __webpack_require__(moduleId) {

            // 检查模块是否在缓存中,存在则直接返回该模块的 exports
            // 譬如在一个模块中有这样的语句 const mod1 = require('./mod1')
            // 在webpack解析源码的过程中已经将require转化为__webpack_require__，
            // 实际执行到这一行时相当于在执行 const mod1 = __webpack_require__('./mod1');
            // 若此时该模块已经在缓存池中则直接取值，若不在则将该模块加
            // 载出来并放入缓存池中，这样可以确保所有用到的模块最多加载
            // 一次，避免了重复加载，既节省时间又减少了打包后代码的体积。
            if(installedModules[moduleId]) {
                return installedModules[moduleId].exports;
            }
            // 创建一个新模块，并且放入缓存
            var module = installedModules[moduleId] = {
                identify: moduleId,
                loaded: false,
                exports: {}
            };

            // 运行模块函数
            // 将上面声明的module以及module.exports和__webpack_require__作为形参传入modules数组
            // 里面的函数，在这些函数里面也存在着module、exports和__webpack_require__，
            // 这样一来就可以把module.exports的内容或是exports的内容挂载到上面声明的module上，
            // 挂载完毕后再把module放进缓存池中
            modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

            // 标记模块已加载
            module.loaded = true;

            // 返回模块的 exports 属性
            return module.exports;
        }


        // 暴露 webpack 模块,modules 就是参数传进来的数组，是个匿名函数数组
        __webpack_require__.modules = modules;

        // 模块缓存
        __webpack_require__.cache = installedModules;

        // define getter function for harmony exports
        __webpack_require__.defineGetter = function(exports, name, getter) {
            if(!__webpack_require__.hasOwnProperty(exports, name)) {
                Object.defineProperty(exports, name, {
                    configurable: false,
                    enumerable: true,
                    get: getter
                });
            }
        };

        // getDefaultExport
        // 此处判断该模块是node的模块还是es6的模块，若是node的模块则直接取值，
        // 若为es6模块则要在default上取值
        // 该函数在es6模块和commonjs模块互相混合使用时会被调用
        __webpack_require__.getDefaultExport = function(module) {
            var getter = module && module.__esModule ?
                function getDefault() { return module['default']; } :
                function getModuleExports() { return module; };
            __webpack_require__.defineGetter(getter, 'a', getter);
            return getter;
        };

        // Object.prototype.hasOwnProperty.call
        __webpack_require__.hasOwnProperty = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

        // __webpack_public_path__
        __webpack_require__.publicPath = "";

        // 加载入口模块并返回exports
        return __webpack_require__(__webpack_require__.s = 0);
    })
    /************************************************************************/
    ([
        /* 0 */
        /***/ (function(module, exports) {


                function component() {
                    var element = document.createElement('div');

                    // Lodash（目前通过一个 script 脚本引入）对于执行这一行是必需的
                    element.innerHTML =  'hello'

                    return element;
                }

                document.body.appendChild(component());

            /***/ })
    ]);