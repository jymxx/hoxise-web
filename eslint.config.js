import { defineConfig } from 'eslint-define-config'

export default defineConfig({
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'vue', 'prettier'],
  rules: {
    // ========== 代码质量 ==========
    'no-console': 'warn', // 禁止 console
    'no-debugger': 'warn', // 禁止 debugger
    'no-unused-vars': 'off', // 关闭默认规则，用 TS 版本
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }], // 未使用变量警告（_开头允许）
    '@typescript-eslint/no-explicit-any': 'off', // 允许 any 类型
    '@typescript-eslint/explicit-module-boundary-types': 'off', // 不强制要求函数返回类型

    // ========== Vue 规范 ==========
    'vue/multi-word-component-names': 'off', // 关闭多词组件名要求
    'vue/require-default-prop': 'off', // 不强制要求 prop 默认值
    'vue/no-setup-props-destructure': 'off', // 允许解构 props

    // ========== 代码格式 ==========
    'prettier/prettier': [
      'warn',
      {
        semi: false, // 无分号
        singleQuote: true, // 单引号
        trailingComma: 'all', // 末尾逗号
        printWidth: 100, // 行宽 100
        tabWidth: 2, // 2 空格缩进
        useTabs: false, // 空格缩进
        arrowParens: 'always', // 箭头函数括号
        endOfLine: 'auto', // 自动换行
        singleAttributePerLine: false, // HTML 属性每行一个（false 表示多个属性在同一行）
      },
    ],
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
})
