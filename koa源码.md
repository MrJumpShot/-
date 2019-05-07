# Koa源码解读

## application.js

> application.js中导出一个类，实例化该类可以得到一个APP，并将context、request、response挂在到该实例上。

    class Application extends Emitter {

        constructor() {
            super();

            this.proxy = false; // 是否信任 proxy header 参数，默认为 false

            this.middleware = []; //保存通过app.use(middleware)注册的中间件

            this.subdomainOffset = 2; // 子域默认偏移量，默认为 2

            this.env = process.env.NODE_ENV || 'development'; // 环境参数，默认为 NODE_ENV 或 ‘development’

            this.context = Object.create(context); //context模块，通过context.js创建

            this.request = Object.create(request); //request模块，通过request.js创建

            this.response = Object.create(response); //response模块，通过response.js创建
        }

        // ...
    }

> use函数主要用于注册中间件

    use(fn) {
        if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
        if (isGeneratorFunction(fn)) {
            deprecate('Support for generators will be removed in v3. ' +
                    'See the documentation for examples of how to convert old middleware ' +
                    'https://github.com/koajs/koa/blob/master/docs/migration.md');
            fn = convert(fn);
        }
        debug('use %s', fn._name || fn.name || '-');
        this.middleware.push(fn);
        return this;
    }

> listen函数封装了http创建服务器的方法，由该函数可知，一个koa实例可以listen多个端口，这种情况下会创建多个http server。

    listen(...args) {
        debug('listen');
        const server = http.createServer(this.callback());
        return server.listen(...args);
    }

> callback函数，返回一个新的函数，新函数接受req和res作为参数，因为该函数是要作为http.createServer的方法传入的

    callback() {
        // 先将middleware都compose起来，fn接受context和next作为参数，此处传入context，但是next为undefined。
        const fn = compose(this.middleware);

        if (!this.listeners('error').length) this.on('error', this.onerror);

        const handleRequest = (req, res) => {
            const ctx = this.createContext(req, res);
            return this.handleRequest(ctx, fn)
        };

        return handleRequest;
    }

> handleRequest方法，作为callback函数的辅助函数

    handleRequest(ctx, fnMiddleware) {
        const res = ctx.res;
        res.statusCode = 404;
        const onerror = err => ctx.onerror(err);    // 错误处理
        const handleResponse = () => respond(ctx);  // 响应处理
        // 为res 对象添加错误处理响应，当res响应结束时，执行context中的onerror函数
        // 这里需要注意区分 context 与 koa 实例中的onerror
        onFinished(res, onerror);
        // 执行中间件数组中的所有函数，并结束时调用上面的respond函数
        return fnMiddleware(ctx).then(handleResponse).catch(onerror);
    }

> createContext函数，用于封装node原生的req和res对象，并得到koa的context、request、response。

    createContext(req, res) {
        const context = Object.create(this.context);
        const request = context.request = Object.create(this.request);
        const response = context.response = Object.create(this.response);
        context.app = request.app = response.app = this;
        context.req = request.req = response.req = req;
        context.res = request.res = response.res = res;
        request.ctx = response.ctx = context;
        request.response = response;
        response.request = request;
        context.originalUrl = request.originalUrl = req.url;
        context.state = {};
        return context;
    }