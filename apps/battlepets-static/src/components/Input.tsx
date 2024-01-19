import styles from './input.module.scss'

import type React from 'react'

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = props => (
  <input className={styles.input} {...props} />
)
