# 关于cookie

## 起源

早期的 Web 应用面临的最大问题之一就是如何维持状态。简言之，服务器无法知道两个请求是否来自于同一个浏览器。当时，最简单的办法就是在请求的页面中插入一个 token，然后在下次请求时将这个 token 返回至服务器。这需要在页面的 form 表单中插入一个包含 token 的隐藏域，或者将 token 放在 URL 的 query 字符串中来传递。这两种方法都需要手动操作，而且极易出错。

而cookie是浏览器在向目标域发送请求时会自动带上的

## cookie的组成

### 过期时间选项
紧跟 cookie 值后面的每个选项都以分号和空格分开，每个选择都指定了 cookie 在什么情况下应该被发送至服务器。第一个选项是过期时间（expires），指定了 cookie 何时不会再被发送至服务器，随后浏览器将删除该 cookie。该选项的值是一个 Wdy, DD-Mon-YYYY HH:MM:SS GMT 日期格式的值，例如：

    Set-Cookie: name=Nicholas; expires=Sat, 02 May 2009 23:38:25 GMT
没有设置 expires 选项时，cookie 的生命周期仅限于当前会话中，关闭浏览器意味着这次会话的结束，所以会话 cookie 仅存在于浏览器打开状态之下。这就是为什么为什么当你登录一个 Web 应用时经常会看到一个复选框，询问你是否记住登录信息：如果你勾选了复选框，那么一个 expires 选项会被附加到登录 cookie 中。如果 expires 设置了一个过去的时间点，那么这个 cookie 会被立即删掉。

### domain 选项
下一个选项是 domain，指定了 cookie 将要被发送至哪个或哪些域中。默认情况下，domain 会被设置为创建该 cookie 的页面所在的域名，所以当给相同域名发送请求时该 cookie 会被发送至服务器。例如，本博中 cookie 的默认值将是 bubkoo.com。domain 选项可用来扩充 cookie 可发送域的数量，例如：

    Set-Cookie: name=Nicholas; domain=nczonline.net
像 Yahoo! 这种大型网站，都会有许多 name.yahoo.com 形式的站点（例如：my.yahoo.com, finance.yahoo.com 等等）。将一个 cookie 的 domain 选项设置为 yahoo.com，就可以将该 cookie 的值发送至所有这些站点。浏览器会把 domain 的值与请求的域名做一个尾部比较（即从字符串的尾部开始比较），并将匹配的 cookie 发送至服务器。

domain 选项的值必须是发送 Set-Cookie 消息头的主机名的一部分，例如我不能在 google.com 上设置一个 cookie，因为这会产生安全问题。不合法的 domain 选择将直接被忽略。

这就意味着在设置domain的时候只能设置为当前域或是父域

### path 选项
另一个控制 Cookie 消息头发送时机的选项是 path 选项，和 domain 选项类似，path 选项指定了请求的资源 URL 中必须存在指定的路径时，才会发送Cookie 消息头。这个比较通常是将 path 选项的值与请求的 URL 从头开始逐字符比较完成的。如果字符匹配，则发送 Cookie 消息头，例如：

    Set-Cookie:name=Nicholas;path=/blog
在这个例子中，path 选项值会与 /blog，/blogrool 等等相匹配；任何以 /blog 开头的选项都是合法的。需要注意的是，只有在 domain 选项核实完毕之后才会对 path 属性进行比较。path 属性的默认值是发送 Set-Cookie 消息头所对应的 URL 中的 path 部分。

### secure 选项
最后一个选项是 secure。不像其它选项，该选项只是一个标记而没有值。只有当一个请求通过 SSL 或 HTTPS 创建时，包含 secure 选项的 cookie 才能被发送至服务器。这种 cookie 的内容具有很高的价值，如果以纯文本形式传递很有可能被篡改，例如：

    Set-Cookie: name=Nicholas; secure
事实上，机密且敏感的信息绝不应该在 cookie 中存储或传输，因为 cookie 的整个机制原本都是不安全的。默认情况下，在 HTTPS 链接上传输的 cookie 都会被自动添加上 secure 选项。

### HTTP-Only cookies
微软的 IE6 SP1 在 cookie 中引入了一个新的选项：HTTP-only，HTTP-Only 背后的意思是告之浏览器该 cookie 绝不能通过 JavaScript 的 document.cookie 属性访问。设计该特征意在提供一个安全措施来帮助阻止通过 JavaScript 发起的跨站脚本攻击 (XSS) 窃取 cookie 的行为（我会在另一篇博客中讨论安全问题，本篇如此已足够）。今天 Firefox2.0.0.5+、Opera9.5+、Chrome 都支持 HTTP-Only cookie。3.2 版本的 Safari 仍不支持。

要创建一个 HTTP-Only cookie，只要向你的 cookie 中添加一个 HTTP-Only 标记即可：

    Set-Cookie: name=Nicholas; HttpOnly


## 注意：
cookie的访问限制于跨域之间有些区别，这里需要注意，譬如说访问baidu.com时生成的cookie在一些子域也可以使用，wenku.baidu.com等都可以使用，但是在跨域中，只要协议、域名（包括主域名和子域名，只要有一个不同就是域名不同），端口任意一个不同就是跨域了
