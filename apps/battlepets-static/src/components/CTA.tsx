import styles from './cta.module.scss'
import { EmailForm, EmailFormProps } from './EmailForm'
import { Socials } from './Socials'

interface CTAProps extends EmailFormProps {
  heading: string
}

export const CTA: React.FC<CTAProps> = ({
  buttonText,
  buttonVariant,
  email,
  hasSignedUp,
  heading,
  onEmailChange,
  onSuccess,
}) => (
  <>
    <h4>{heading}</h4>
    <p className={styles.ctaText}>
      Join the waitlist to get the <strong>$BPETS airdrop</strong> and sign up for our <strong>public sale</strong> at
      an exclusive price!
    </p>
    <EmailForm
      className={styles.ctaSignUpForm}
      email={email}
      onEmailChange={onEmailChange}
      hasSignedUp={hasSignedUp}
      onSuccess={onSuccess}
      buttonVariant={buttonVariant}
      buttonText={buttonText}
    />
    <Socials />
  </>
)
