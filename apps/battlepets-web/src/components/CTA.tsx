import { PRESALE_URL } from 'battlepets-shared/constants'
import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'

import globalStyles from '@/common/global.module.scss'

import { Button } from './Button'
import styles from './cta.module.scss'
import { EmailForm, EmailFormProps } from './EmailForm'
import { Socials } from './Socials'

interface CTAProps extends EmailFormProps {
  variant?: 'link' | 'email'
  heading: React.ReactNode
  ctaText: React.ReactNode
  image?: {
    data: StaticImageData
    alt: string
    wrapperClassName?: string
  }
}

export const CTA: React.FC<CTAProps> = ({
  buttonText,
  buttonVariant,
  ctaText,
  email,
  hasSignedUp,
  heading,
  image,
  inputVariant,
  onEmailChange,
  onSuccess,
  variant = 'email',
}) => (
  <>
    <h4 className={globalStyles.slideInVerticalOnReveal1}>{heading}</h4>
    <p className={`${globalStyles.sectionText} ${globalStyles.slideInVerticalOnReveal2}`}>{ctaText}</p>
    {image && (
      <div className={globalStyles.scaleInOnReveal2}>
        <div className={`${styles.ctaImageWrapper} ${image.wrapperClassName ?? ''}`}>
          <Image
            src={image.data}
            alt={image.alt}
            fill
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 36em) 39rem, (max-width: 48.375em) 41rem, (max-width: 62em) 44rem, (max-width: 75.0625em) 50rem, 54rem"
          />
        </div>
      </div>
    )}
    {variant !== 'email' ? (
      <Link
        className={`${styles.ctaLink} ${globalStyles.slideInVerticalOnReveal3}`}
        href={PRESALE_URL}
        rel="noopener noreferrer nofollow"
      >
        <Button asDiv variant={buttonVariant}>
          {buttonText}
        </Button>
      </Link>
    ) : (
      <EmailForm
        className={`${styles.ctaSignUpForm} ${globalStyles.slideInVerticalOnReveal3}`}
        email={email}
        onEmailChange={onEmailChange}
        hasSignedUp={hasSignedUp}
        onSuccess={onSuccess}
        inputVariant={inputVariant}
        buttonVariant={buttonVariant}
        buttonText={buttonText}
      />
    )}
    <Socials className={globalStyles.slideInVerticalOnReveal3} />
  </>
)
