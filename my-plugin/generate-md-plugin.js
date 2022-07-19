/**
 * 该插件用于打包目录时生成一个 filelist.md 文件，文件的内容是将所有的构建生成文件展示在一个列表中：
 */
class GenerateMdPlugin {
  constructor() {
    console.log('创建了 GenerateMdPlugin 对象~')
  }

  apply(compiler) {
    // 选择 emit 钩子来注册 hook 事件：因为该生命周期是资源文件输入到目标目录时
    compiler.hooks.emit.tapAsync('GenerateMdPlugin', (compilation, callback) => {
      var filelist = "In this build: \n"

      // 通过 compilation 实例遍历访问所有编译过的资源文件
      for (const filename in compilation.assets) {
        filelist = filelist + '-' + filename + '\n'
      }

      // 将 filelist 的内容作为一个新的文件资源，插入到 webpack 构建中
      compilation.assets['filelist.md'] = {
        source() {
          return filelist
        },
        size() {
          return filelist.length
        }
      }
      callback()
    })
  }
}

module.exports = GenerateMdPlugin