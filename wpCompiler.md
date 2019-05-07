# Compiler类

> webpack中进行源码修改和构建依赖关系的类的简化

    const path = require('path');
    const loadUtils = require('load-utils');
    // AST语法树的解析模块
    const babylon = require('babylon');
    const types = require('@babel/types');
    const traverse = require('@babel/traverse').default;
    const generator = require('@babel/generator').default;
    const ejs = require('ejs');
    cosnt { SyncHook } = require('tapable');

    class Compiler {
        // config对象是webpack的配置对象
        constructor(config) {
            this.config = config;
            this.entryId;
            this.entry = config.entry;
            this.modules = {};
            // 得到当前执行webpack的路径
            this.root = process.cwd();
            // 设置一些钩子来调用相应的plugin
            this.hooks = {

            }
        }

        run() {
            this.buildModule(path.resolve(this.root, this.entry), true);
            this.emit();
        }

        // 发射打包好的结果
        emit() {
            const main = path.join(this.config.output.path, this.config.output.filename);
            let tempStr = this.getSource(path.join(__dirname, 'template.ejs'));
            const code = ejs.render(tempStr, {
                entryId: this.entryId,
                modules: this.modules,
            })
            this.assests = {};
            this.assests[main] = code;
            fs.writeFileSync(main, code);
        }

        // 此处的modulePath是绝对路径
        buildModule(modulePath, isEntry) {
            let source = this.getSource(modulePath);
            const moduleName = './' + path.relative(this.root, modulePath);
            if(isEntry) {
                this.entryId = moduleName;
            }
            const { sourceCode, dependencies } = this.parce(source, path.dirname(moduleName));
            // 递归构建模块
            dependencies.forEach(dep => {
                this.buildModule(path.join(this.root, dep), false)
            })
        }

        getSource(modulePath, parentPath) {
            let source = fs.readFileSync(modulePath, 'utf-8');
            // 获取rules，使用相应的loader
            const rules = this.config.module.rules;
            for(let i = 0; i < rules.length; i++) {
                if(rules[i].test.test(path.extname(modulePath))) {
                    const rule = rules[i].use;
                    for(let j = 0; j < rule.length; j++) {
                        // loader导出一个接受源码的函数
                        content = require(rule[j])(content);
                    }
                }
            }
            return content;
        }

        // 对源码进行解析修改，主要是将require转化为__webpack_require__函数
        parse(source) {
            let ast = babylon.parse(source);
            let dependencies = [];
            tracerse(ast, {
                CallExpression(p) {
                    let node = p.node;
                    if(node.callee.name === 'require') {
                        node.callee.name = '__webpack_require__';
                        let moduleName = node.argument[0].value;
                        moduleName = moduleName + (path.extname ? '': '.js');
                        moduleName = './' + path.join(parentPath, moduleName);
                        dependencies.push(moduleName);
                        node.arguments = [types.stringLiteral(moduleName)];
                    }
                }
            })
            let sourceCode = generator(ast);
            return { sourceCode, dependencies };
        }
    }