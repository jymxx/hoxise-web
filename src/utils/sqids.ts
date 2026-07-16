import Sqids from 'sqids'

// 混淆顺序
const sqids = new Sqids({
  alphabet: 'F3f9Vq1GgQ7pPj2XxY5R4m6W8N0bBvDdHhKkLlZzJtTruEsCn',
  minLength: 10,
})

/** 将自增 ID 编码为混淆 ID（数字 → 短字符串） */
export function encodeId(id: number): string {
  return sqids.encode([id])
}

/** 将混淆 ID 解码回自增 ID（短字符串 → 数字） */
export function decodeId(code: string): number {
  const [id] = sqids.decode(code)
  return id
}

// ===== 影视详情路由混淆 =====
const routeSqids = new Sqids({
  alphabet: 'Xx9Zz8Yy7Ww6Vv5Uu4Tt3Ss2Rr1Pp0QqNnMmLlKkJjHhGgFfDd',
  minLength: 10,
})

/** 将 catalogId 编码为路由混淆 ID */
export function encodeRouteId(id: number): string {
  return routeSqids.encode([id])
}

/** 将路由混淆 ID 解码回 catalogId */
export function decodeRouteId(code: string): number {
  const [id] = routeSqids.decode(code)
  return id
}
