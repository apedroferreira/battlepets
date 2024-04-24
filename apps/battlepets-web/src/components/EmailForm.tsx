import { useCallback, useEffect, useState } from 'react'

import { EMAIL_REGEX } from '@/common/constants'

import { Button, ButtonProps } from './Button'
import styles from './emailForm.module.scss'
import { Input, InputProps } from './Input'

const SIGN_UP_URL = '/api/signup'

const checkmarkIcon = (
  <svg className={styles.checkmarkIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92.49 68.83">
    <path d="M34.76 35.48 18.25 18.23 0 35.77l34.38 33.06 58.11-55.85L79.21 0 34.76 35.48z" />
  </svg>
)

export interface EmailFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  email: string
  onEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  hasSignedUp?: boolean
  onSuccess: () => void
  inputVariant?: InputProps['variant']
  buttonText: React.ReactNode
  buttonVariant?: ButtonProps['variant']
}

export const EmailForm: React.FC<EmailFormProps> = ({
  buttonText,
  buttonVariant,
  email,
  hasSignedUp = false,
  inputVariant,
  onEmailChange,
  onSuccess,
  ...rest
}) => {
  const [emailErrorMessage, setEmailErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [submitErrorMessage, setSubmitErrorMessage] = useState('')
  const [isSubmitForceDisabled, setIsSubmitForceDisabled] = useState(false)

  const validateEmail = useCallback(() => {
    setSubmitErrorMessage('')

    const isEmailFormatValid = EMAIL_REGEX.test(email)
    if (!email) {
      setEmailErrorMessage('Email is required.')
    } else if (!isEmailFormatValid) {
      setEmailErrorMessage('Must use a valid email address.')
    } else {
      setEmailErrorMessage('')
    }

    return isEmailFormatValid
  }, [email])

  const signUp = useCallback(async () => {
    setSubmitErrorMessage('')
    setIsSubmitting(true)

    try {
      const response = await fetch(SIGN_UP_URL, {
        method: 'POST',
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        if (response.status !== 400) {
          throw new Error('An unexpected error occurred.')
        } else {
          const responseJson = (await response.json()) as { message: string }
          throw new Error(responseJson.message)
        }
      }

      onSuccess()
    } catch (error) {
      setIsSubmitForceDisabled(true)
      setSubmitErrorMessage((error as Error).message)
    }

    setIsSubmitting(false)
  }, [email, onSuccess])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setHasSubmitted(true)

    const isEmailValid = validateEmail()

    if (isEmailValid) {
      signUp()
    }
  }

  useEffect(() => {
    validateEmail()
  }, [email, validateEmail])

  useEffect(() => {
    if (submitErrorMessage) {
      const timeout = setTimeout(() => {
        setIsSubmitForceDisabled(false)
      }, 2000)

      return () => {
        if (timeout) {
          clearTimeout(timeout)
          setIsSubmitForceDisabled(false)
        }
      }
    }
  }, [submitErrorMessage])

  return hasSignedUp ? (
    <div className={`${rest.className ?? ''} ${styles.formSuccessBox} `}>
      {checkmarkIcon} You’re in! We’ll keep you updated!
    </div>
  ) : (
    <form {...rest} onSubmit={handleSubmit} noValidate>
      <Input
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="Your email"
        value={email}
        onChange={onEmailChange}
        variant={inputVariant}
        errorMessage={hasSubmitted ? emailErrorMessage || submitErrorMessage : ''}
        disabled={isSubmitting}
      />
      <Button
        variant={buttonVariant}
        isLoading={isSubmitting}
        disabled={(hasSubmitted && Boolean(emailErrorMessage)) || isSubmitting || isSubmitForceDisabled}
      >
        {isSubmitting ? 'Signing up…' : buttonText}
      </Button>
    </form>
  )
}
