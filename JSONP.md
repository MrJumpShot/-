# JSONP

## JSONP和AJAX

首先二者是完全不同的东西，AJAX是通过XmlHttpRequest来发起请求，而JSONP是利用script标签动态添加src属性以及附加callback函数来请求数据，在jQUery中的$.ajax可以发送JSONP请求是因为jQuery对ajax进行了封装，把JSONP封装进了他的ajax函数里面

```
    // jQuery封装的JSONP源码

    <script>
        function ajax(option){
            var defalus = {
                jsonp:'callback' //默认发送请求的值是函数名的值   
            }
            // 覆盖默认参数
            for(var attr in option){
                defalus[attr] = option[attr];
            }
            var p = '';
            if(defalus.data){
                for(var key in defalus.data){
                    p += key+ '='+ defalus.data[key] + '&'
                }           
            }
            var cbName ;
            if(defalus.jsonpCallback){
                cbName = defalus.jsonpCallback;
            }else{
                // 回调函数名称
                cbName = 'jQuery' + ('v1.11.1' + Math.random()).replace(/\D/g,'') + '_' + new Date().getTime();
            }
            window[cbName] = function (data){
                defalus.success(data);   
            }
            // 所以jsonpCallback这个参数并不是一个需要自己实现的函数，只是给出一个名字，jQuery会帮我们利用success来实现这个函数并挂载在window下面

            var srcipt = document.createElement('script'); 
            
            srciptt.src = defalus.url + '?' + p + defalus.jsonp + '=' + defalus.jsonpCallback
            var head = document.getElementsByTagName('head')[0];
            head.appendChild(srciptt);
        }
        ajax({
            url: 'http://lp.com/jsonp/data1.php',
            dataType: 'jsonp',
            jsonp: 'callback',
            jsonpCallback: 'hi',
            data: {flag:1,abc:'hi'},
            success: function(data){
                console.log(data)
            }
        });
    </script>

```

## JSONP原理

1. script标签的src不受跨域限制
2. script标签可以把返回的字符串当做代码来执行


JSONP后端代码的实现，需要约定好callback的key，此处使用的key就是‘callback’
```
    var http = require('http');

    var url = require('url');

    var querystring = require('querystring');

    var server = http.createServer();

    server.on('request',function(req, res){
    var urlPath = url.parse(req.url).pathname;
    var qs = querystring.parse(req.url.split('?')[1]);
    if(urlPath === '/jsonp' && qs.callback){
        res.writeHead(200,{'Content-Type':'application/json;charset=utf-8'});
        var data = {
            "name": "Monkey"
        };
        data = JSON.stringify(data);
        var callback = qs.callback+'('+data+');';
        // 发送过来的请求的callback名字为show，则返回的数据就是'show(...)'
        res.end(callback);
    }
    else{
        res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'});
        res.end('Hell World\n');
    }
    });
    server.listen('8080');
    console.log('Server running!');

```

