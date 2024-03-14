import { HTMLAttributes } from 'react'

import styles from './button.module.scss'
import { Loader } from './Loader'
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'fire' | 'ice' | 'promo'
  isLoading?: boolean
  asDiv?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  asDiv = false,
  children,
  className,
  isLoading = false,
  variant = 'ice',
  ...rest
}) => {
  const buttonProps = {
    ...rest,
    className: `${className ?? ''} ${styles.button} ${variant === 'fire' ? styles.fireButton : ''} ${variant === 'ice' ? styles.iceButton : ''} ${variant === 'promo' ? styles.promoButton : ''}`,
  }

  const buttonContent = (
    <>
      {isLoading && (
        <div className={styles.buttonLoader}>
          <Loader />
        </div>
      )}
      {children}
    </>
  )

  return asDiv ? (
    <div {...(buttonProps as HTMLAttributes<HTMLDivElement>)} role="button" tabIndex={0}>
      {buttonContent}
    </div>
  ) : (
    <button {...buttonProps}>{buttonContent}</button>
  )
}
