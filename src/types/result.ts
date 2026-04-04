/**
 * 后端统一返回结果类型
 * 对应后端 CommonResult<T> 类
 */
export interface CommonResult<T> {
  code: number
  data: T
  msg: string
}
