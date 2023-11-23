// babel 里的 parser.parse
function parse(input, options) {
  var _options;
  if (((_options = options) == null ? void 0 : _options.sourceType) === "unambiguous") {
    options = Object.assign({}, options);
    try {
      options.sourceType = "module";
      const parser = getParser(options, input);
      const ast = parser.parse();
      if (parser.sawUnambiguousESM) {
        return ast;
      }
      if (parser.ambiguousScriptDifferentAst) {
        try {
          options.sourceType = "script";
          return getParser(options, input).parse();
        } catch (_unused) {}
      } else {
        ast.program.sourceType = "script";
      }
      return ast;
    } catch (moduleError) {
      try {
        options.sourceType = "script";
        return getParser(options, input).parse();
      } catch (_unused2) {}
      throw moduleError;
    }
  } else {
    return getParser(options, input).parse();
  }
}