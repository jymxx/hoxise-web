/**
 * 角色权限自定义指令
 * 用法：v-hasRole="['admin', 'editor']"
 * 功能：如果没有指定角色，则移除该元素
 */

import type { Directive } from 'vue'
import { checkRole } from '@/utils/permission'

const hasRole: Directive = {
  mounted(el, binding) {
    const { value } = binding

    if (value && Array.isArray(value) && value.length > 0) {
      // 使用工具函数判断角色
      const hasRole = checkRole(value)
      // 如果没有角色，则移除元素
      if (!hasRole) {
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error('请设置角色权限标签值，例如 v-hasRole="[\'admin\']"')
    }
  },
}

export default hasRole
