import styles from './button.module.scss'
import { Loader } from './Loader'
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'fire' | 'ice'
  isLoading?: boolean
}

export const Button: React.FC<ButtonProps> = ({ children, className, isLoading = false, variant = 'ice', ...rest }) => (
  <button
    {...rest}
    className={`${className} ${styles.button} ${variant === 'ice' ? styles.iceButton : styles.fireButton}`}
  >
    {isLoading && (
      <div className={styles.buttonLoader}>
        <Loader />
      </div>
    )}
    {children}
  </button>
)
