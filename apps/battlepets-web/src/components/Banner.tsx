import styles from './banner.module.scss'

interface BannerProps {
  children: React.ReactNode
}

export const Banner: React.FC<BannerProps> = ({ children }) => <div className={styles.banner}>{children}</div>
