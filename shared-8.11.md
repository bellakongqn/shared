## forEach 与 async/await 一起使用的问题

> - https://codesandbox.io/s/foreach-hei13?file=/src/index.js

🤔️🤔️🤔️🤔️🤔️ 请求不按顺序执行 ？

- forEach Polyfill
  > - https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#polyfill
- 简化版 ❗️❗️❗️❗️❗️
  ```
  while(index < arr.length) {
    // 传入的回调函数
    callback(item, index)
  }
  ```

🤔️ 如何解决 ?

### **串行**

#### <em>**方案一**</em> 使用 for of

> - https://codesandbox.io/s/for-of-zrd8n?file=/src/index.js

❓ 为什么 for of 可以

> - 内部处理机制不一样

1. forEach 是直接调用回调函数

```
  for(let i = 0 ; i<arr.length; i++) {
    (async (item) => {
        const res = await getData(item);
        console.log(res);
      })()
  }
```

虽然也有 await 但只阻塞 callback 内部->遍历均已经执行->未按期望输出

2. for…of 通过迭代器的方式去遍历

```
async function test() {
 let arr = [3, 2, 1]
 const iterator = arr[Symbol.iterator]()
 let res = iterator.next()
 while (!res.done) {
  const value = res.value
  const res1 = await fetch(value)
  console.log(res1)
  res = iterator.next()
 }
 console.log('end')
}
```

await 阻塞下次执行 -> 期望输出

#### <em>**方案二**</em> 使用 for 循环

> - https://codesandbox.io/s/for-v74h9?file=/src/index.js

#### <em>**方案二**</em> 使用 while 循环

> - https://codesandbox.io/s/while-v74h9?file=/src/index.js

#### <em>**方案二**</em> 使用 reduce

> - https://codesandbox.io/s/reduce-3o81f?file=/src/index.js

#### **并行**

#### <em>**方案二**</em> 使用 map

> -https://codesandbox.io/s/map-3mf5t?file=/src/index.js

参考

1. https://gist.github.com/joeytwiddle/37d2085425c049629b80956d3c618971
2. https://juejin.cn/post/6844904202989223949
3. https://libin1991.github.io/2019/04/17/%E4%B8%BA%E5%95%A5await%E4%B8%8D%E8%83%BD%E7%94%A8%E5%9C%A8forEach%E4%B8%AD/
