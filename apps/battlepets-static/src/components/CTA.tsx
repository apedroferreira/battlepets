import { Button, ButtonProps } from './Button'
import styles from './cta.module.scss'
import { Input } from './Input'
import { Socials } from './Socials'

interface CTAProps {
  heading: string
  buttonText: string
  buttonVariant?: ButtonProps['variant']
}

export const CTA: React.FC<CTAProps> = ({ buttonText, buttonVariant, heading }) => (
  <>
    <h4>{heading}</h4>
    <p className={styles.ctaText}>
      Join the waitlist to get the <strong>$BPETS airdrop</strong> and sign up for our <strong>public sale</strong> at
      an exclusive price!
    </p>
    <form className={styles.ctaSignUpForm}>
      <Input type="email" placeholder="Your email" />
      <Button variant={buttonVariant}>{buttonText}</Button>
    </form>
    <Socials />
  </>
)
