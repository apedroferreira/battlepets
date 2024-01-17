import Image from 'next/image'
import Link from 'next/link'

import { TELEGRAM_URL, X_URL } from '@/common/constants'
import globalStyles from '@/common/global.module.scss'

import telegramLogo from '../../public/images/telegramlogo.svg'
import xLogo from '../../public/images/xlogo.svg'

import styles from './socials.module.scss'

interface SocialsProps {
  hideCaption?: boolean
}

export const Socials: React.FC<SocialsProps> = ({ hideCaption = false }) => {
  const socialButtons = (
    <div className={styles.socialButtonsWrapper}>
      <Link
        href={TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={styles.socialButtonWrapper}
      >
        <Image src={telegramLogo} alt="Telegram logo" fill style={{ objectFit: 'contain' }} />
      </Link>
      <Link href={X_URL} target="_blank" rel="noopener noreferrer nofollow" className={styles.socialButtonWrapper}>
        <Image src={xLogo} alt="X logo" fill style={{ objectFit: 'contain' }} />
      </Link>
    </div>
  )

  return hideCaption ? (
    socialButtons
  ) : (
    <div className={globalStyles.captionContainer}>
      <p className={globalStyles.captionText}>Join the community!</p>
      {socialButtons}
    </div>
  )
}
