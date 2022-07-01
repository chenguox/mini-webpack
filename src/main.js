// const foo = () => {
//   let name = 'aaa'
//   console.log('foo',name)
// }

// foo()

import code from './doc.md'

import '../style/code.css'
import 'highlight.js/styles/default.css'

// 可以打印查看一下我们的内容
console.log(code);

document.body.innerHTML = code
