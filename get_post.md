# get和post请求

## get和post有什么区别？
其实，GET和POST本质上两者没有任何区别。他们都是HTTP协议中的请求方法。底层实现都是基于TCP/IP协议。所谓区别，只是浏览器厂家根据约定，做得限制而已。

1. get是通过明文发送数据请求，而post是通过密文；
2. get传输的数据量有限，因为url的长度有限，post则不受限；
3. GET请求的参数只能是ASCII码，所以中文需要URL编码，而POST请求传参没有这个限制
4. GET产生一个TCP数据包；POST产生两个TCP数据包。对于GET方式的请求，浏览器会把http header和data一并发送出去，服务器响应200（返回数据）；而对于POST，浏览器先发送header（OPTIONS方法），服务器响应100 continue，浏览器再发送data，服务器响应200 ok（返回数据）。


## 补充
### 请求方法：

1. GET
2. POST
3. HEAD
4. OPTIONS
5. PUT
6. PATCH
7. DELETE
8. TRACE
9. CONNECT