import Sqids from 'sqids'

// 混淆顺序
const sqids = new Sqids({
  alphabet: 'F3f9Vq1GgQ7pPj2XxY5R4m6W8N0bBvDdHhKkLlZzJtTruEsCn',
  minLength: 8,
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
