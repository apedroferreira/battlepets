import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { CSSTransition } from 'react-transition-group'

import { ToastType } from '@/common/enums'

export interface ToastProps {
  message: string | JSX.Element
  type?: ToastType
  isVisible?: boolean
  onClose: () => void
}

export const Toast: React.FC<ToastProps> = ({ isVisible, message, onClose, type = ToastType.SUCCESS }) => {
  const toastRef = useRef<HTMLDivElement | null>(null)

  return createPortal(
    <div className="toast-wrapper">
      <CSSTransition in={isVisible} classNames="toast" timeout={300} unmountOnExit nodeRef={toastRef}>
        <div
          ref={toastRef}
          className={`toast ${type === ToastType.ERROR ? 'toast-error' : 'toast-success'}`}
          onClick={onClose}
        >
          {message}
        </div>
      </CSSTransition>
    </div>,
    document.body
  )
}
