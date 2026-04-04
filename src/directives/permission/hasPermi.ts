/**
 * 操作权限自定义指令
 * 用法：v-hasPermi="['system:user:add', 'system:user:edit']"
 * 功能：如果没有指定权限，则移除该元素
 */

import type { Directive } from 'vue'
import { checkPermi } from '@/utils/permission'

const hasPermi: Directive = {
  mounted(el, binding) {
    const { value } = binding

    if (value && Array.isArray(value) && value.length > 0) {
      // 使用工具函数判断权限
      const hasPermission = checkPermi(value)
      // 如果没有权限，则移除元素
      if (!hasPermission) {
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error('请设置操作权限标签值，例如 v-hasPermi="[\'system:user:add\']"')
    }
  },
}

export default hasPermi
