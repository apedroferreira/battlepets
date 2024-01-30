import styles from './button.module.scss'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'fire' | 'ice'
}

export const Button: React.FC<ButtonProps> = ({ className, variant = 'ice', ...rest }) => (
  <button
    {...rest}
    className={`${className} ${styles.button} ${variant === 'ice' ? styles.iceButton : styles.fireButton}`}
  />
)
