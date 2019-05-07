
# HTTP状态码

## 1XX

- 100 **(Continue)**
- 101 **(Switching Protocols)**

## 2XX

- 200 **(Ok)**
- 201 **(Created)**
- 202 **(Accepted)**
- 204 **(No Content)**

## 3XX

- 300 **(Multiple Choice)**
- 301 **(Moved Permanently)**
- 302 **(Found)**
- 303 **(See Other)**
- 304 **(Not Modified)**
- 305 **(Use Proxy)**
- 307 **(Temprary Redirect)**

## 4XX

- 400 **(Bad Request)**
- 401 **(Unauthorized)**
- 403 **(Forbidden)**
- 404 **(Not Found)**
- 405 **(Method Not Allowed)**
- 406 **(Not Acceptable)**

## 5XX

- 500 **(Interal Server Error)**
- 501 **(Not Implemented)**
- 502 **(Bad Gataway)**
- 503 **(Service Unavailable)**
- 504 **(Gateway Timeout)**
- 505 **(HTTP Version Not Supported)**

# HTTP的幂等性

## 幂等性的定义：

> Methods can also have the property of "idempotence" in that (aside from error or expiration issues) the side-effects of N > 0 identical requests is the same as for a single request.  

从定义上看，`HTTP`方法的幂等性是指一次和多次请求某一个资源应该具有同样的副作用。幂等性属于语义范畴，正如编译器只能帮助检查语法错误一样，`HTTP`规范也没有办法通过消息格式等语法手段来定义它，这可能是它不太受到重视的原因之一。但实际上，幂等性是分布式系统设计中十分重要的概念，而`HTTP`的分布式本质也决定了它在`HTTP`中具有重要地位。  

`POST`和`PUT`的区别容易被简单地误认为“`POST`表示创建资源，`PUT`表示更新资源”；而实际上，二者均可用于创建资源，更为本质的差别是在幂等性方面

`GET`、`PUT`是幂等的，`POST`是非幂等的  

所以`HTTP`状态码将302细化为303和307，其中303对于`POST`请求，认为该请求已经成功处理，无需客户端再次确认，直接转为`GET`请求进行自动的重定向，而307状态码则是认为`POST`请求进行重定向时需要客户端再次确认才可以重定向，重定向时发送的是`POST`请求，若使用302则会产生混乱。
