// loader 本身是一个函数，接收文件模块内容作为参数，经过改造处理返回新的文件内容。
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const t = require("@babel/types");

function transformArrowLoader(sourceCode) {
  const ast = parser.parse(sourceCode, {
    sourceType: "module",
  });
  traverse(ast, {
    ArrowFunctionExpression(path, state) {
      const node = path.node;
      const body = path.get("body");
      const bodyNode = body.node;
      if (bodyNode.type !== "BlockStatement") {
        const statements = [];
        statements.push(t.returnStatement(bodyNode));
        node.body = t.blockStatement(statements);
      }
      node.type = "FunctionExpression";
    },
  });
  const { code } = generator(ast);

  return code;
}

module.exports = transformArrowLoader;
