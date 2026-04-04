/**
 * Axios 请求封装
 * 负责统一处理请求拦截器（添加 token）和响应拦截器
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { getToken } from '@/utils/auth'
import type { CommonResult } from '@/types/result'

// ========== 常量 ==========
const DEFAULT_TIMEOUT = 180000 // 3 分钟超时
const SUCCESS_CODE = 200 // 后端成功状态码

// ========== 创建 axios 实例 ==========
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API, // 从环境变量读取 API 地址
  timeout: DEFAULT_TIMEOUT,
})

// ========== 请求拦截器 ==========
service.interceptors.request.use(
  (config) => {
    // 让每个请求携带 token
    const token = getToken()
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// ========== 响应拦截器 ==========
service.interceptors.response.use(
  (response: AxiosResponse<CommonResult<any>>) => {
    const res = response.data

    // 统一校验业务状态码
    if (res.code !== SUCCESS_CODE) {
      return Promise.reject(new Error(res.msg || '请求失败'))
    }

    // 成功则直接返回解包后的数据
    return res.data
  },
  (error) => {
    // 处理 HTTP 错误
    if (error.response?.status === 401) {
      // TODO: 执行登出逻辑，跳转登录页
    }
    return Promise.reject(error)
  },
)

export default service
