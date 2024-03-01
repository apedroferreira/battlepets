import styles from './button.module.scss'
import { Loader } from './Loader'
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'fire' | 'ice' | 'promo'
  isLoading?: boolean
}

export const Button: React.FC<ButtonProps> = ({ children, className, isLoading = false, variant = 'ice', ...rest }) => (
  <button
    {...rest}
    className={`${className ?? ''} ${styles.button} ${variant === 'fire' ? styles.fireButton : ''} ${variant === 'ice' ? styles.iceButton : ''} ${variant === 'promo' ? styles.promoButton : ''}`}
  >
    {isLoading && (
      <div className={styles.buttonLoader}>
        <Loader />
      </div>
    )}
    {children}
  </button>
)
