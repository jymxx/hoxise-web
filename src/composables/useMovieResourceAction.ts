import { reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCatalogExtraResourceUrl } from '@/api/movie/movieCatalogExtra'

export function useResourceAction() {
  const fetchingIds = reactive<Record<number, boolean>>({})
  const fetchedUrls = reactive<Record<number, string>>({})

  /** 获取资源真实地址（含密码处理），返回 url 或 undefined */
  const handleGetResourceUrl = async (item: any): Promise<string | undefined> => {
    let secret: string | undefined

    if (item.hasSecret) {
      try {
        const { value } = await ElMessageBox.prompt('', '请输入密码', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'text',
          inputValidator: (v: string) => !!v,
          inputErrorMessage: '请输入密码',
        })
        secret = value
      } catch {
        return
      }
    }

    fetchingIds[item.id] = true
    try {
      const res = await getCatalogExtraResourceUrl(item.id, secret)
      const url = res || ''
      fetchedUrls[item.id] = url
      return url
    } catch (error) {
      ElMessage.error(error || '获取资源地址失败')
      return
    } finally {
      fetchingIds[item.id] = false
    }
  }

  return { handleGetResourceUrl, fetchingIds, fetchedUrls }
}
