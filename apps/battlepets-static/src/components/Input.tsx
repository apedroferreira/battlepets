import styles from './input.module.scss'

const errorIcon = (
  <svg className={styles.inputErrorIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 275 275">
    <g>
      <path d="M137.5 21c31.12 0 60.37 12.12 82.38 34.12 22 22 34.12 51.26 34.12 82.38s-12.12 60.37-34.12 82.38c-22 22-51.26 34.12-82.38 34.12s-60.37-12.12-82.38-34.12c-22-22-34.12-51.26-34.12-82.38s12.12-60.37 34.12-82.38c22-22 51.26-34.12 82.38-34.12m0-21C61.56 0 0 61.56 0 137.5S61.56 275 137.5 275 275 213.44 275 137.5 213.44 0 137.5 0Z" />
      <path d="M132.96 173.75s-27.86-51.84-16.91-90.67c5.47-19.41 19.23-24.13 31.4-20.39 14.47 4.44 27.81 48.4-14.5 111.07Z" />
      <circle cx="132.93" cy="204.72" r="14.77" />
    </g>
  </svg>
)

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  errorMessage?: string
}

export const Input: React.FC<InputProps> = ({ className, errorMessage = '', ...rest }) => (
  <div className={styles.inputWrapper}>
    <input {...rest} className={`${className} ${styles.input} ${errorMessage ? styles.inputError : ''}`} />
    {errorMessage && (
      <div className={styles.inputErrorBox}>
        {errorIcon}
        <div className={styles.inputErrorText}>{errorMessage}</div>
      </div>
    )}
  </div>
)
