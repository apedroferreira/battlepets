import styles from './button.module.scss'

import type React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'fire' | 'ice'
}

export const Button: React.FC<ButtonProps> = ({ variant = 'ice', ...rest }) => (
  <button className={`${styles.button} ${variant === 'ice' ? styles.iceButton : styles.fireButton}`} {...rest} />
)
