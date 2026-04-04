/**
 * Prettier 配置
 * 用于代码格式化，与 ESLint 集成
 */
export default {
  // 行宽
  printWidth: 120,
  // 缩进
  tabWidth: 2,
  useTabs: false,
  // 分号
  semi: false,
  // 引号
  singleQuote: true,
  // 对象引号
  quoteProps: 'as-needed',
  // JSX 引号
  jsxSingleQuote: false,
  // 末尾逗号
  trailingComma: 'all',
  // 空格
  bracketSpacing: true,
  bracketSameLine: true,
  // 箭头函数括号
  arrowParens: 'always',
  // 换行符
  endOfLine: 'auto',
  // Vue 文件中的脚本缩进
  vueIndentScriptAndStyle: false,
  // HTML 属性每行一个（false 表示多个属性在同一行）
  singleAttributePerLine: false,
}
