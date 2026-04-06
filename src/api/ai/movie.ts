/**
 * AI 影视相关 API
 * AI 生成简介、AI 推荐
 */

import { getToken } from '@/utils/auth'

const MODULE = '/ai/movie'

/**
 * 获取环境变量中的基础 API 地址
 */
// function getBaseApi(): string {
//   // 开发环境直接返回配置的地址
//   // 生产环境可能需要根据实际部署调整
//   return import.meta.env.VITE_BASE_API || 'http://localhost:18888/hoxise'
// }

/**
 * AI 生成影视简介 (SSE 流式)
 * @param catalogId 影视 ID
 */
// export function getAISummary(catalogId: string | number): EventSource {
//   const baseApi = getBaseApi()
//   const token = getToken()
//   const eventSourceUrl = `${baseApi}${MODULE}/aiSummary?catalogid=${catalogId}&token=${token}`
//   return new EventSource(eventSourceUrl)
// }

// /**
//  * AI 推荐影视 (SSE 流式)
//  * @param userText 用户输入
//  * @param chatId 对话 ID
//  * @param mode 模式：chat(聊天) | reasoner(深度思考)
//  */
// export function aiRecommend(
//   userText: string,
//   chatId: string,
//   mode: 'chat' | 'reasoner' = 'chat'
// ): EventSource {
//   const baseApi = getBaseApi()
//   const eventSourceUrl = `${baseApi}${MODULE}/aiRecommend?userText=${encodeURIComponent(userText)}&chatId=${chatId}&mode=${mode}`
//   return new EventSource(eventSourceUrl)
// }
