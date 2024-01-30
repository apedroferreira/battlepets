import styles from './input.module.scss'

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...rest }) => (
  <input {...rest} className={`${className} ${styles.input}`} />
)
