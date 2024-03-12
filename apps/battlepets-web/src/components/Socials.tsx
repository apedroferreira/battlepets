import { TELEGRAM_URL, X_URL } from 'battlepets-shared/constants'
import Image from 'next/image'
import Link from 'next/link'

import globalStyles from '@/common/global.module.scss'

import telegramLogo from '../../public/images/telegramlogo.svg'
import xLogo from '../../public/images/xlogo.svg'

import styles from './socials.module.scss'

import type { StaticImport } from 'next/dist/shared/lib/get-img-props'

interface SocialsProps {
  className?: string
  hideCaption?: boolean
}

export const Socials: React.FC<SocialsProps> = ({ className, hideCaption = false }) => {
  const socialButtons = (
    <div className={styles.socialButtonsWrapper}>
      <Link
        href={TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={styles.socialButtonWrapper}
      >
        <Image
          src={telegramLogo as StaticImport}
          alt="Telegram logo"
          fill
          style={{ objectFit: 'contain' }}
          sizes="(max-width: 62em) 4.5rem, (max-width: 90.0625em) 5rem, 5.4rem"
        />
      </Link>
      <Link href={X_URL} target="_blank" rel="noopener noreferrer nofollow" className={styles.socialButtonWrapper}>
        <Image
          src={xLogo as StaticImport}
          alt="X logo"
          fill
          style={{ objectFit: 'contain' }}
          sizes="(max-width: 62em) 4.5rem, (max-width: 90.0625em) 5rem, 5.4rem"
        />
      </Link>
    </div>
  )

  return hideCaption ? (
    socialButtons
  ) : (
    <div className={`${className ?? ''} ${globalStyles.captionWrapper}`}>
      <p className={globalStyles.captionText}>Join the community!</p>
      {socialButtons}
    </div>
  )
}
