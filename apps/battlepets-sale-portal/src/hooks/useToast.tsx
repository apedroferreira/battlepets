import { useCallback, useRef, useState } from 'react'

import { ToastType } from '@/common/enums'
import { Toast } from '@/components/Toast'

import type { ToastProps } from '@/components/Toast'

const DEFAULT_TOAST_DURATION = 5500 // milliseconds

type DynamicToastProps = Pick<ToastProps, 'message' | 'type'>

export type ShowToastType = (props: DynamicToastProps, duration?: number) => void

interface UseToastPayload {
  showToast: ShowToastType
  toastTarget: JSX.Element | null
}

export const useToast = (): UseToastPayload => {
  const [toast, setToast] = useState<DynamicToastProps>({
    message: '',
    type: ToastType.SUCCESS,
  })
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [isVisible, setIsVisible] = useState(false)

  const showToast = useCallback((props: DynamicToastProps, duration = DEFAULT_TOAST_DURATION) => {
    const toastTimeout = toastTimeoutRef.current

    if (toastTimeout) {
      clearTimeout(toastTimeout)
      setIsVisible(false)
      setTimeout(() => {
        setToast(props)
        setIsVisible(true)
      }, 0)
    } else {
      setToast(props)
      setIsVisible(true)
    }

    window.scroll({
      top: 0,
    })

    toastTimeoutRef.current = setTimeout(() => {
      setIsVisible(false)
    }, duration)
  }, [])

  const handleClose = useCallback(() => {
    setIsVisible(false)
  }, [])

  return {
    showToast,
    toastTarget: <Toast {...toast} isVisible={isVisible} onClose={handleClose} />,
  }
}
