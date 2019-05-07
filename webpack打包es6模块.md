# webpack打包es6模块

> 由于es6模块的规范与commonjs模块规范不同，所以在导入导出es6模块时需要进行一些转化

    // m.js
    'use strict';
    export default function bar () {
        return 1;
    };
    export function foo () {
        return 2;
    }

    // index.js
    'use strict';
    import bar, {foo} from './m';
    bar();
    foo();

> 对于上述两个模块打包后的结果如下，仅展示modules数组部分

    [
        (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
            Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
            /* harmony import */
            var __WEBPACK_IMPORTED_MODULE_0__m__ = __webpack_require__(1);

            Object(__WEBPACK_IMPORTED_MODULE_0__m__["a" /* default */])();
            Object(__WEBPACK_IMPORTED_MODULE_0__m__["b" /* foo */])();

        }),
        (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
            // webpack在解析模块时，遇到es6语法的export default等语法时，就将源代码进行改造，把这些导出的属性挂载到__webpack_exports__上，为了方便后面的导入，也方便了在将模块放入缓存池中时将这些导出的属性挂载到新建的module的exports上
            Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
            /* harmony export (immutable) */
            __webpack_exports__["a"] = bar;
            /* harmony export (immutable) */
            __webpack_exports__["b"] = foo;

            function bar () {
                return 1;
            };
            function foo () {
                return 2;
            }

        })
    ]

> es6模块与commonjs模块混用的情况就用上了__webpack_require__.n()这个函数

    // m.js
    'use strict';
    exports.foo = function () {
        return 1;
    }

    // index.js
    'use strict';
    import m from './m';
    m.foo();

    [
        /* 0 */
        (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
            Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
            /* harmony import */
            var __WEBPACK_IMPORTED_MODULE_0__m__ = __webpack_require__(1);
            /* harmony import */
            var __WEBPACK_IMPORTED_MODULE_0__m___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__m__);

            __WEBPACK_IMPORTED_MODULE_0__m___default.a.foo();

        }),
        /* 1 */
        (function(module, exports, __webpack_require__) {

            "use strict";
            exports.foo = function () {
                return 1;
            }

        })
    ]