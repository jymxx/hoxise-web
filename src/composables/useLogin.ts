/**
 * 登录对话框 Composable
 * 用于在任何组件中方便地控制登录对话框
 */

import { computed } from 'vue'
import { useUIStore } from '@/store/modules/ui'

export function useLogin() {
  const uiStore = useUIStore()

  return {
    showLogin: computed({
      get: () => uiStore.showLogin,
      set: (value: boolean) => (value ? uiStore.openLoginDialog() : uiStore.closeLoginDialog()),
    }),
    open: uiStore.openLoginDialog,
    close: uiStore.closeLoginDialog,
  }
}
