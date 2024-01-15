import styles from './input.module.scss'

import type React from 'react'

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className={styles.input} {...props} />
)
