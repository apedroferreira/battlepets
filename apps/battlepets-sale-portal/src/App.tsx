import * as anchor from '@coral-xyz/anchor'
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { BASE_URL, CONTACT_EMAIL, LITEPAPER_URL, TELEGRAM_URL, X_URL } from 'battlepets-shared/constants'
import saleIdl from 'battlepets-shared/idls/battlepets_public_sale.json'
import { useCallback, useEffect, useMemo, useState } from 'react'

import bpetsLogo from '@/assets/bpetslogo.png'
import inputErrorIcon from '@/assets/inputerroricon.svg'
import logo from '@/assets/logo.png'
import solLogo from '@/assets/sollogo.png'
import telegramLogo from '@/assets/telegramlogo.svg'
import xLogo from '@/assets/xlogo.svg'
import {
  FUND_RAISER_PUBLIC_KEY,
  HARD_CAP_SOL_AMOUNT,
  HAS_PROCESSED_SALE_END,
  MAX_ALLOCATION_SOL_AMOUNT,
  MIN_ALLOCATION_SOL_AMOUNT,
  SALE_ENDS_AT_TIMESTAMP,
  SALE_NAME,
  SALE_PROGRAM_ID,
  SOFT_CAP_SOL_AMOUNT,
  SOLANA_DECIMALS,
  SOL_BPETS_EXCHANGE_RATE,
} from '@/common/constants'
import { ToastType } from '@/common/enums'
import { LiveTime } from '@/components/LiveTime'
import { Loader } from '@/components/Loader'
import { useToast } from '@/hooks/useToast'
import { escapeRegExp, formatLargeStatNumber } from '@/utils/generalUtils'
import { encodePDASeed } from '@/utils/solanaUtils'

import type { BattlepetsPublicSale } from 'battlepets-shared/types/battlepets_public_sale'

import '@/App.scss'

const INPUT_REGEX = RegExp('^\\d*(?:\\\\[.])?\\d*$')

export const App: React.FC = () => {
  const { connection } = useConnection()
  const { connected: isConnected, publicKey } = useWallet()
  const anchorWallet = useAnchorWallet()

  const { showToast, toastTarget } = useToast()

  const [isSaleOpen, setIsSaleOpen] = useState(false)

  const [currentAllocation, setCurrentAllocation] = useState<number | null>(null)
  const adjustedCurrentAllocation = currentAllocation ?? 0

  const [totalAllocation, setTotalAllocation] = useState(0)

  const [SOLAmount, setSOLAmount] = useState('')
  const SOLAmountNumber = useMemo(() => +parseFloat(Number(SOLAmount).toFixed(SOLANA_DECIMALS)), [SOLAmount])
  const [SOLAmountErrorMessage, setSOLAmountErrorMessage] = useState('')

  const remainingAllocation = useMemo(
    () => Math.min(MAX_ALLOCATION_SOL_AMOUNT - adjustedCurrentAllocation, HARD_CAP_SOL_AMOUNT - totalAllocation),
    [adjustedCurrentAllocation, totalAllocation]
  )
  const remainingAllocationText = useMemo(
    () => (+parseFloat(remainingAllocation.toFixed(SOLANA_DECIMALS))).toString(),
    [remainingAllocation]
  )

  const [saleProgram, setSaleProgram] = useState<anchor.Program<BattlepetsPublicSale>>()

  const [isLoadingSale, setIsLoadingSale] = useState(true)
  const [isLoadingSaleAllocation, setIsLoadingSaleAllocation] = useState(true)
  const [isLoadingAddAllocation, setIsLoadingAddAllocation] = useState(false)

  const getSalePda = useCallback((program: anchor.Program<BattlepetsPublicSale>) => {
    const [salePda] = anchor.web3.PublicKey.findProgramAddressSync([encodePDASeed('global')], program.programId)
    return salePda
  }, [])

  const getSaleAllocationPda = useCallback(
    (program: anchor.Program<BattlepetsPublicSale>) => {
      if (publicKey) {
        const [saleAllocationPda] = anchor.web3.PublicKey.findProgramAddressSync(
          [publicKey.toBuffer()],
          program.programId
        )
        return saleAllocationPda
      }
    },
    [publicKey]
  )

  const refreshSale = useCallback(
    async (program: anchor.Program<BattlepetsPublicSale>) => {
      const salePda = getSalePda(program)

      try {
        const saleAccount = await program.account.saleState.fetchNullable(salePda)

        if (saleAccount) {
          setIsSaleOpen(saleAccount.open as boolean)
          setTotalAllocation(Number(saleAccount.amount) / anchor.web3.LAMPORTS_PER_SOL)
        }
      } catch (error) {
        showToast({ message: (error as Error).message, type: ToastType.ERROR })
        setIsLoadingSale(false)
        throw error
      }

      setIsLoadingSale(false)
    },
    [getSalePda, showToast]
  )

  const refreshSaleAllocation = useCallback(
    async (program: anchor.Program<BattlepetsPublicSale>) => {
      const saleAllocationPda = getSaleAllocationPda(program)

      if (saleAllocationPda) {
        try {
          const saleAllocationAccount = await program.account.saleAllocationState.fetchNullable(saleAllocationPda)

          if (saleAllocationAccount) {
            setCurrentAllocation(Number(saleAllocationAccount.amount) / anchor.web3.LAMPORTS_PER_SOL)
          } else {
            setCurrentAllocation(0)
          }
        } catch (error) {
          showToast({ message: (error as Error).message, type: ToastType.ERROR })
          setIsLoadingSaleAllocation(false)
          throw error
        }

        setIsLoadingSaleAllocation(false)
      }
    },
    [getSaleAllocationPda, showToast]
  )

  useEffect(() => {
    if (saleProgram) {
      const salePda = getSalePda(saleProgram)

      const saleChangeSubscriptionId = connection.onAccountChange(salePda, () => {
        refreshSale(saleProgram)
      })

      return () => {
        connection.removeAccountChangeListener(saleChangeSubscriptionId)
      }
    }
  }, [connection, getSalePda, refreshSale, saleProgram])

  useEffect(() => {
    const provider = new anchor.AnchorProvider(connection, anchorWallet!, {})
    anchor.setProvider(provider)

    const program = new anchor.Program(saleIdl as anchor.Idl as BattlepetsPublicSale, SALE_PROGRAM_ID, provider)
    setSaleProgram(program)

    refreshSaleAllocation(program)
    refreshSale(program)
  }, [anchorWallet, connection, refreshSaleAllocation, refreshSale])

  const validateSOLAmount = useCallback(
    (amount: string) => {
      const amountNumber = Number(amount)

      const isOverMaxAllocation = adjustedCurrentAllocation + amountNumber > MAX_ALLOCATION_SOL_AMOUNT
      const isOverHardCap = totalAllocation + amountNumber > HARD_CAP_SOL_AMOUNT

      if (
        amount &&
        amountNumber &&
        currentAllocation !== null &&
        adjustedCurrentAllocation + amountNumber < MIN_ALLOCATION_SOL_AMOUNT
      ) {
        setSOLAmountErrorMessage(`SOL amount must not be under min. allocation of ${MIN_ALLOCATION_SOL_AMOUNT}.`)
      } else if (
        amount &&
        isOverMaxAllocation &&
        (!isOverHardCap ||
          MAX_ALLOCATION_SOL_AMOUNT - adjustedCurrentAllocation <= HARD_CAP_SOL_AMOUNT - totalAllocation)
      ) {
        setSOLAmountErrorMessage(
          `SOL amount must not go over max. allocation of ${MAX_ALLOCATION_SOL_AMOUNT}${adjustedCurrentAllocation > 0 ? ` (${formatLargeStatNumber(MAX_ALLOCATION_SOL_AMOUNT - adjustedCurrentAllocation)} SOL left)` : ''}.`
        )
      } else if (amount && isOverHardCap) {
        setSOLAmountErrorMessage(
          `SOL amount must not go over total sale allocation of ${HARD_CAP_SOL_AMOUNT} (${formatLargeStatNumber(HARD_CAP_SOL_AMOUNT - totalAllocation)} SOL left).`
        )
      } else {
        setSOLAmountErrorMessage('')
      }
    },
    [adjustedCurrentAllocation, currentAllocation, totalAllocation]
  )

  const handleSOLAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const amount = event.target.value.replace(/,/g, '.')

      if (amount === '' || INPUT_REGEX.test(escapeRegExp(amount))) {
        validateSOLAmount(amount)
        setSOLAmount(amount)
      }
    },
    [validateSOLAmount]
  )

  const handleMaxClick = useCallback(() => {
    setSOLAmountErrorMessage('')
    setSOLAmount(remainingAllocationText)
  }, [remainingAllocationText])

  const handleFormSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      const runSubmit = async () => {
        if (saleProgram) {
          setIsLoadingAddAllocation(true)

          const lamports = new anchor.BN(SOLAmountNumber * anchor.web3.LAMPORTS_PER_SOL)

          try {
            await saleProgram.methods
              .addSaleAllocation(lamports)
              .accounts({
                saleAllocation: getSaleAllocationPda(saleProgram),
                sale: getSalePda(saleProgram),
                fundRaiser: FUND_RAISER_PUBLIC_KEY,
              })
              .rpc()
          } catch (error) {
            showToast({ message: (error as Error).message, type: ToastType.ERROR })
            setIsLoadingAddAllocation(false)
            throw error
          }

          const BPETSAmount = formatLargeStatNumber(SOLAmountNumber * SOL_BPETS_EXCHANGE_RATE)

          await refreshSaleAllocation(saleProgram)

          showToast({ message: `🎉 You’ve reserved ${BPETSAmount} BPETS!`, type: ToastType.SUCCESS })
          setSOLAmount('')
          setIsLoadingAddAllocation(false)
        }
      }

      event.preventDefault()

      runSubmit()
    },
    [SOLAmountNumber, getSaleAllocationPda, getSalePda, refreshSaleAllocation, saleProgram, showToast]
  )

  useEffect(() => {
    if (!isConnected) {
      setCurrentAllocation(null)
    }
    validateSOLAmount(SOLAmount)
  }, [SOLAmount, isConnected, validateSOLAmount])

  useEffect(() => {
    validateSOLAmount
  }, [totalAllocation, validateSOLAmount])

  const hasSaleEnded = Date.now() > SALE_ENDS_AT_TIMESTAMP || totalAllocation >= HARD_CAP_SOL_AMOUNT
  const isSoftCapReached = totalAllocation >= SOFT_CAP_SOL_AMOUNT

  return (
    <>
      <header>
        <a href={BASE_URL} target="_blank" rel="noreferrer">
          <img src={logo} className="header-logo" alt="Battlepets logo" />
        </a>
        <WalletMultiButton />
      </header>
      <main>
        <h1 className="h1">{SALE_NAME}</h1>
        <div className="progress-bar-wrapper">
          <label className="label" htmlFor="progress-bar">
            Total sale progress:
          </label>
          <div id="progress-bar" className="progress-bar">
            <div
              className="progress-bar-progress"
              style={{ transform: `scaleX(${totalAllocation / HARD_CAP_SOL_AMOUNT})` }}
            />
            <div className="progress-bar-values">
              <span className="high-energy-text">{isLoadingSale ? '…' : formatLargeStatNumber(totalAllocation)}</span>/
              <span>{formatLargeStatNumber(HARD_CAP_SOL_AMOUNT)}</span> SOL
            </div>
            <div
              className="soft-cap-marker"
              style={{ width: `${(SOFT_CAP_SOL_AMOUNT / HARD_CAP_SOL_AMOUNT) * 100}%` }}
            />
            <div
              className="soft-cap-marker-label"
              style={{ left: `${(SOFT_CAP_SOL_AMOUNT / HARD_CAP_SOL_AMOUNT) * 100}%` }}
            >
              🎯 Soft cap{isSoftCapReached ? ' reached!' : ''} ({formatLargeStatNumber(SOFT_CAP_SOL_AMOUNT)} SOL)
            </div>
            <div className="progress-bar-timer">
              {isLoadingSale && 'Loading. Please wait…'}
              {hasSaleEnded && !isLoadingSale && 'Sale has ended.'}
              {!hasSaleEnded &&
                !isLoadingSale &&
                (isSaleOpen ? (
                  <div className="progress-bar-time">
                    <div>Sale ends in:&nbsp;</div>
                    <div className="progress-bar-time-counter">
                      <span className="high-energy-text">
                        <LiveTime timestamp={SALE_ENDS_AT_TIMESTAMP} />
                      </span>
                    </div>
                  </div>
                ) : (
                  'Sale is closed.'
                ))}
            </div>
            {isLoadingSale && (
              <div className="progress-bar-loader">
                <Loader />
              </div>
            )}
          </div>
        </div>
        <div className="conversion">
          1 <img src={solLogo} className="token-logo" alt="Solana token logo" />
          SOL =&nbsp;
          {formatLargeStatNumber(SOL_BPETS_EXCHANGE_RATE)}{' '}
          <img src={bpetsLogo} className="token-logo bpets-token-logo" alt="BPETS token logo" />
          BPETS
        </div>
        {isSaleOpen && !hasSaleEnded && (
          <>
            <p className="conversion-note">Min. allocation: {formatLargeStatNumber(MIN_ALLOCATION_SOL_AMOUNT)} SOL</p>
            <p className="conversion-note">Max. allocation: {formatLargeStatNumber(MAX_ALLOCATION_SOL_AMOUNT)} SOL</p>
          </>
        )}
        {isSaleOpen && !hasSaleEnded && adjustedCurrentAllocation < MAX_ALLOCATION_SOL_AMOUNT && (
          <form className="form" onSubmit={handleFormSubmit}>
            <div className="input-wrapper">
              <label className="label" htmlFor="amount">
                SOL amount to buy:
              </label>
              <img src={solLogo} className="input-icon" alt="Solana token logo" />
              <input
                className={`input ${SOLAmountErrorMessage ? 'input-error' : ''}`}
                id="amount"
                name="amount"
                inputMode="decimal"
                autoComplete="off"
                autoCorrect="off"
                type="text"
                pattern="^[0-9]*[.,]?[0-9]*$"
                placeholder="0"
                minLength={1}
                maxLength={79}
                spellCheck="false"
                value={SOLAmount}
                onChange={handleSOLAmountChange}
                disabled={isLoadingAddAllocation}
              />
              {SOLAmountErrorMessage && (
                <div className="input-error-box">
                  <img src={inputErrorIcon} className="input-error-icon" />
                  <div className="input-error-text">{SOLAmountErrorMessage}</div>
                </div>
              )}
              {!isLoadingAddAllocation &&
                adjustedCurrentAllocation + remainingAllocation >= MIN_ALLOCATION_SOL_AMOUNT &&
                SOLAmount !== remainingAllocationText && (
                  <button className="max-amount-button" type="button" onClick={handleMaxClick}>
                    Max: {formatLargeStatNumber(remainingAllocation)}
                  </button>
                )}
            </div>
            {isConnected ? (
              <button
                className="button"
                disabled={!SOLAmountNumber || Boolean(SOLAmountErrorMessage) || isLoadingAddAllocation}
              >
                {isLoadingAddAllocation ? (
                  <>
                    <div className="button-loader">
                      <Loader />
                    </div>
                    Reserving BPETS…
                  </>
                ) : (
                  <>
                    Reserve {formatLargeStatNumber(SOLAmountNumber * SOL_BPETS_EXCHANGE_RATE)}{' '}
                    <img src={bpetsLogo} className="token-logo-small" alt="BPETS token logo" />
                    BPETS
                  </>
                )}
              </button>
            ) : (
              <WalletMultiButton />
            )}
          </form>
        )}
        {isConnected &&
          (isLoadingSaleAllocation ? (
            <div className="allocation-loader">
              <Loader />
            </div>
          ) : (
            <div className="allocation-wrapper">
              <label className="label" htmlFor="allocation">
                Your {isSaleOpen ? 'current ' : ''}allocation:
              </label>
              <div id="allocation" className="allocation">
                <span className="high-energy-text">
                  {formatLargeStatNumber(adjustedCurrentAllocation)} SOL (
                  {formatLargeStatNumber(adjustedCurrentAllocation * SOL_BPETS_EXCHANGE_RATE)} BPETS)
                </span>
              </div>
              {adjustedCurrentAllocation > 0 && (
                <p className="allocation-note">
                  {isSaleOpen || isSoftCapReached ? (
                    <>
                      ✅{' '}
                      {HAS_PROCESSED_SALE_END ? (
                        <>
                          You have been sent{' '}
                          <strong>
                            {formatLargeStatNumber(adjustedCurrentAllocation * SOL_BPETS_EXCHANGE_RATE)} BPETS
                          </strong>
                          !
                        </>
                      ) : (
                        <>
                          You will receive{' '}
                          <strong>
                            {formatLargeStatNumber(adjustedCurrentAllocation * SOL_BPETS_EXCHANGE_RATE)} BPETS
                          </strong>{' '}
                          once the token is listed!
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      😔 The sale did not reach the soft cap of {SOFT_CAP_SOL_AMOUNT} SOL, so{' '}
                      <strong>{formatLargeStatNumber(adjustedCurrentAllocation)} SOL</strong>{' '}
                      {HAS_PROCESSED_SALE_END ? 'have been returned to you' : 'will be returned to you soon'}.
                    </>
                  )}
                </p>
              )}
            </div>
          ))}
        {toastTarget}
      </main>
      <footer>
        <div className="footer-top-border" />
        <div className="footer-content">
          <div className="footer-left">
            <a href={BASE_URL} target="_blank" rel="noreferrer">
              <img src={logo} className="footer-logo" alt="Battlepets logo" />
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="footer-contact"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
          <nav>
            <ul>
              <li>
                <a href={BASE_URL} target="_blank" rel="noreferrer">
                  Home
                </a>
              </li>
              <li>
                <a href={`${BASE_URL}#game`} target="_blank" rel="noreferrer">
                  Game
                </a>
              </li>
              <li>
                <a href={`${BASE_URL}#token`} target="_blank" rel="noreferrer">
                  Token
                </a>
              </li>
              <li>
                <a href={`${BASE_URL}#roadmap`} target="_blank" rel="noreferrer">
                  Roadmap
                </a>
              </li>
              <li>
                <a href={LITEPAPER_URL} target="_blank" rel="noopener noreferrer nofollow">
                  Litepaper
                </a>
              </li>
            </ul>
          </nav>
          <div className="footer-socials">
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer nofollow">
              <img src={telegramLogo} className="social-button" alt="Telegram logo" />
            </a>
            <a href={X_URL} target="_blank" rel="noopener noreferrer nofollow">
              <img src={xLogo} className="social-button" alt="X logo" />
            </a>
          </div>
        </div>
        <div className="footer-copyright">© {new Date().getFullYear()} Battlepets. All rights reserved.</div>
      </footer>
    </>
  )
}
