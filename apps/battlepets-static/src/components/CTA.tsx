import Image, { StaticImageData } from 'next/image'

import globalStyles from '@/common/global.module.scss'

import styles from './cta.module.scss'
import { EmailForm, EmailFormProps } from './EmailForm'
import { Socials } from './Socials'

interface CTAProps extends EmailFormProps {
  heading: string
  image?: {
    data: StaticImageData
    alt: string
    wrapperClassName?: string
  }
}

export const CTA: React.FC<CTAProps> = ({
  buttonText,
  buttonVariant,
  email,
  hasSignedUp,
  heading,
  image,
  inputVariant,
  onEmailChange,
  onSuccess,
}) => (
  <>
    <h4 className={globalStyles.slideInVerticalOnReveal1}>{heading}</h4>
    <p className={`${styles.ctaText} ${globalStyles.slideInVerticalOnReveal2}`}>
      Join the waitlist to get the <strong>$BPETS airdrop</strong> and sign up for our <strong>public sale</strong> at
      an exclusive price!
    </p>
    {image && (
      <div className={globalStyles.scaleInOnReveal2}>
        <div className={`${styles.ctaImageWrapper} ${image.wrapperClassName ?? ''}`}>
          <Image src={image.data} alt={image.alt} fill style={{ objectFit: 'contain' }} />
        </div>
      </div>
    )}
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
    <Socials className={globalStyles.slideInVerticalOnReveal3} />
  </>
)
