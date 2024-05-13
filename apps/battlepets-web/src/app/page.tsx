'use client'

import { CONTACT_EMAIL, LITEPAPER_URL, STATUS_URL } from 'battlepets-shared/constants'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { Lightbox } from 'yet-another-react-lightbox'
import LightboxFullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import LightboxZoom from 'yet-another-react-lightbox/plugins/zoom'

import { BANNER_CONTENT } from '@/common/constants'
import globalStyles from '@/common/global.module.scss'
import { Banner } from '@/components/Banner'
import { Button } from '@/components/Button'
import { CTA } from '@/components/CTA'
import { EmailForm } from '@/components/EmailForm'
import { RevealedSection } from '@/components/RevealedSection'
import { Socials } from '@/components/Socials'

import appStoreLogo from '../../public/images/appstorelogo.svg'
import background1 from '../../public/images/background1.png'
import background2 from '../../public/images/background2.png'
import background3 from '../../public/images/background3.png'
import battlePet1 from '../../public/images/battlepet1.png'
import battlePet2 from '../../public/images/battlepet2.png'
import battlePet3 from '../../public/images/battlepet3.png'
import card1 from '../../public/images/card1.png'
import card2 from '../../public/images/card2.png'
import card3 from '../../public/images/card3.png'
import googlePlayLogo from '../../public/images/googleplaylogo.svg'
import logo from '../../public/images/logo.png'
import promoCard from '../../public/images/promocard.png'
import screenshot from '../../public/images/screenshot.png'
import solanaLogo from '../../public/images/solanalogo.svg'
import token from '../../public/images/token.png'

import styles from './page.module.scss'

import type { StaticImport } from 'next/dist/shared/lib/get-img-props'

const TOKEN_METRICS: { value: string; caption: React.ReactNode }[] = [
  {
    value: '100M',
    caption: (
      <>
        Max <strong>BPETS</strong> supply
      </>
    ),
  },
  {
    value: '$0.012',
    caption: 'Est. Presale price',
  },
  {
    value: '$696K',
    caption: 'Est. Presale market cap',
  },
]

/* eslint-disable react/jsx-key */
const ROADMAP_POINTS: { heading: string; items: React.ReactNode[] }[] = [
  {
    heading: 'Q2 2024',
    items: [
      <strong>Airdrop</strong>,
      <strong>BPETS presale</strong>,
      <>
        <strong>BPETS</strong> token launch
      </>,
    ],
  },
  {
    heading: 'Q3-Q4 2024',
    items: ['Battlepets DAO', 'Create starter cards', 'Battlepets NFT web store', 'Game development'],
  },
  {
    heading: 'Q1 2025',
    items: ['Beta game launch'],
  },
  {
    heading: 'Q2 2025',
    items: ['Public game launch'],
  },
]
/* eslint-enable react/jsx-key */

const Home = () => {
  const [email, setEmail] = useState('')
  const [hasSignedUp, setHasSignedUp] = useState(false)

  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const handleEmailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
  }, [])

  const handleSignUpSuccess = useCallback(() => {
    setHasSignedUp(true)
  }, [])

  const handleToggleLightbox = useCallback(() => {
    setIsLightboxOpen(previousIsLightboxOpen => !previousIsLightboxOpen)
  }, [])

  return (
    <>
      {BANNER_CONTENT && <Banner>{BANNER_CONTENT}</Banner>}
      <div className={styles.page}>
        <header>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <Link href="/" className={styles.headerLogoWrapper}>
                <Image
                  src={logo}
                  alt="Battlepets logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 36em) 8.6rem, (max-width: 62em) 9.2rem, (max-width: 75.0625em) 9.6rem, (max-width: 90.0625em) 10rem, 11rem"
                  priority
                  unoptimized
                />
              </Link>
              <nav>
                <ul>
                  <li>
                    <Link href="#game">Game</Link>
                  </li>
                  <li>
                    <Link href="#token">Token</Link>
                  </li>
                  <li>
                    <Link href="#roadmap">Roadmap</Link>
                  </li>
                </ul>
              </nav>
            </div>
            <Link href={LITEPAPER_URL} target="_blank" rel="noopener noreferrer nofollow">
              <Button asDiv className={styles.headerActionButton}>
                Read Litepaper
              </Button>
            </Link>
          </div>
        </header>
        <main>
          <div className={styles.intro}>
            <div className={styles.introBackgroundWrapper}>
              <div className={styles.introMobileFireBackground} />
              <div className={styles.introMobileIceBackground} />
              <div className={styles.introFireBackground} />
              <div className={styles.introIceBackground} />
            </div>
            <RevealedSection className={styles.hero}>
              <div className={styles.sectionContent}>
                <h1>
                  <span className={globalStyles.fireText}>Ready</span> To{' '}
                  <span className={globalStyles.iceText}>Battle</span>?
                </h1>
                <div className={styles.heroContent}>
                  <p className={styles.heroText}>
                    Join the waitlist to get the <strong>BPETS</strong>{' '}
                    <span className={globalStyles.iceText}>airdrop</span> and sign up for our{' '}
                    <span className={globalStyles.fireText}>public sale</span> at pre-launch price!
                  </p>
                  <EmailForm
                    className={styles.heroSignUpForm}
                    email={email}
                    onEmailChange={handleEmailChange}
                    hasSignedUp={hasSignedUp}
                    onSuccess={handleSignUpSuccess}
                    buttonVariant="fire"
                    buttonText="I’m in!"
                  />
                </div>
                <div className={styles.heroCaptions}>
                  <div className={globalStyles.captionWrapper}>
                    <p className={globalStyles.captionText}>Soon on</p>
                    <div className={styles.solanaLogoWrapper}>
                      <Image
                        src={solanaLogo as StaticImport}
                        alt="Solana logo"
                        fill
                        style={{ objectFit: 'contain' }}
                        priority
                      />
                    </div>
                  </div>
                  <Socials />
                </div>
              </div>
              <div className={styles.heroImages}>
                <div className={styles.heroPortalsSquare1} />
                <div className={styles.heroPortalsSquare2} />
                <div className={styles.heroPortalsSquare3} />
                <div className={styles.heroIceImageWrapper}>
                  <div className={styles.heroIceDecoration} />
                  <div className={styles.heroIcePortal}>
                    <div className={styles.heroIcePortalScene}>
                      <Image
                        src={background1}
                        alt="Futuristic City Background"
                        fill
                        style={{ objectFit: 'cover', objectPosition: 'bottom center' }}
                        sizes="(max-width: 48.375em) 13.2rem, (max-width: 62em) 16.6rem, (max-width: 75.0625em) 22.2rem, 25.3rem"
                        priority
                        placeholder="blur"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.heroFireImageWrapper}>
                  <div className={styles.heroFireDecoration} />
                  <div className={styles.heroFirePortal}>
                    <div className={styles.heroFirePortalScene}>
                      <Image
                        src={background2}
                        alt="Enchanted Forest Background"
                        fill
                        style={{ objectFit: 'cover', objectPosition: 'bottom center' }}
                        sizes="(max-width: 48.375em) 16.6rem, (max-width: 62em) 18.2rem, (max-width: 75.0625em) 24.5rem, (max-width: 90.0625em) 29.3rem, 33.2rem"
                        priority
                        placeholder="blur"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.heroPet1Wrapper}>
                  <Image
                    src={battlePet1}
                    alt="Samurai Dog Battlepet"
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="(max-width: 48.375em) 19.55rem, (max-width: 62em) 23.8rem, (max-width: 75.0625em) 32.3rem, (max-width: 90.0625em) 35.7rem, 38.25rem"
                    priority
                  />
                </div>
                <div className={styles.heroPet2Wrapper}>
                  <Image
                    src={battlePet2}
                    alt="Roman Soldier Turtle Battlepet"
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="(max-width: 48.375em) 13.43rem, (max-width: 62em) 14.79rem, (max-width: 75.0625em) 19.89rem, (max-width: 90.0625em) 23.1rem, 25.5rem"
                    priority
                  />
                </div>
                <div className={styles.heroPet3Wrapper}>
                  <Image
                    src={battlePet3}
                    alt="Devil Cat Battlepet"
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="(max-width: 48.375em) 18.366rem, (max-width: 62em) 20.1rem, (max-width: 75.0625em) 27.2rem, (max-width: 90.0625em) 32.3rem, 34.85rem"
                    priority
                  />
                </div>
              </div>
            </RevealedSection>
            <RevealedSection>
              <div id="game" className={styles.sectionTarget} />
              <div className={`${styles.sectionContent} ${styles.featuresSectionContent}`}>
                <h2 className={globalStyles.slideInVerticalOnReveal1}>
                  <span className={globalStyles.fireText}>The ultimate </span> deck-builder,{' '}
                  <span className={globalStyles.iceText}>auto&#8209;battler</span> game in crypto!
                </h2>
                <div className={styles.features}>
                  <div className={styles.feature}>
                    <div className={styles.featureBackground} />
                    <div className={globalStyles.scaleInOnReveal1}>
                      <div className={styles.featureImageWrapper1}>
                        <Image
                          src={card1}
                          alt="Ice Wizard Dog Battlepet Card"
                          fill
                          style={{ objectFit: 'contain' }}
                          sizes="(max-width: 48.375em) 100vw, 33vw"
                        />
                      </div>
                    </div>
                    <h5 className={globalStyles.slideInVerticalOnReveal1}>Collect</h5>
                    <p className={globalStyles.slideInVerticalOnReveal1}>
                      Collect NFT battle cards with different pets and rarities to build your deck!
                    </p>
                  </div>
                  <div className={styles.feature}>
                    <div className={styles.featureBackground} />
                    <div className={globalStyles.scaleInOnReveal2}>
                      <div className={styles.featureImageWrapper2}>
                        <div className={styles.featureBattleFirePortal}>
                          <div className={styles.featureBattleIcePortal} />
                          <div className={styles.featureBattlePortalScene}>
                            <Image
                              src={background3}
                              alt="Battle Arena Background"
                              fill
                              style={{ objectFit: 'cover', objectPosition: 'bottom center' }}
                              sizes="(max-width: 36em) 13.872rem, (max-width: 48.375em) 14.28rem, (max-width: 62em) 14.96rem, (max-width: 75.0625em) 18.275rem, (max-width: 90.0625em) 20.655rem, 24.48rem"
                              priority
                              placeholder="blur"
                            />
                          </div>
                          <div className={styles.featureBattleCard2Wrapper}>
                            <Image
                              src={card2}
                              alt="Hitman Dog Battlepet Card"
                              fill
                              style={{ objectFit: 'contain' }}
                              sizes="(max-width: 62em) 15rem, (max-width: 90.0625em) 18rem, 22rem"
                            />
                          </div>
                          <div className={styles.featureBattleCard3Wrapper}>
                            <Image
                              src={card3}
                              alt="Hacker Cat Battlepet Card"
                              fill
                              style={{ objectFit: 'contain' }}
                              sizes="(max-width: 62em) 17rem, (max-width: 90.0625em) 20rem, 24rem"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <h5 className={globalStyles.slideInVerticalOnReveal2}>Battle</h5>
                    <p className={globalStyles.slideInVerticalOnReveal2}>
                      Battle against other players to win rewards, including new NFTs!
                    </p>
                  </div>
                  <div className={styles.feature}>
                    <div className={styles.featureBackground} />
                    <div className={globalStyles.scaleInOnReveal3}>
                      <div className={styles.featureImageWrapper3}>
                        <Image
                          src={token}
                          alt="BPETS token"
                          fill
                          style={{ objectFit: 'contain' }}
                          sizes="(max-width: 48.375em) 100vw, 33vw"
                        />
                      </div>
                    </div>
                    <h5 className={globalStyles.slideInVerticalOnReveal3}>Engage</h5>
                    <p className={globalStyles.slideInVerticalOnReveal3}>
                      Influence the game and get exclusive benefits with the <strong>BPETS</strong> token!
                    </p>
                  </div>
                </div>
              </div>
            </RevealedSection>
          </div>
          <div className={styles.gamePreview}>
            <RevealedSection>
              <div className={`${styles.sectionContent} ${styles.gamePreviewSectionContent}`}>
                <h4 className={globalStyles.slideInVerticalOnReveal1}>
                  Coming soon, <span className={globalStyles.highEnergyText}>free-to-play</span> in any mobile device!
                </h4>
                <p className={`${globalStyles.sectionText} ${globalStyles.slideInVerticalOnReveal2}`}>
                  Rank up in <span className={globalStyles.highEnergyText}>real-time</span> online battles and
                  tournaments, or go on a quest in the offline rogue-lite{' '}
                  <span className={globalStyles.highEnergyText}>adventure</span> mode!
                </p>
                <div className={styles.screenshotOuterWrapper}>
                  <div className={styles.screenshotWrapper} onClick={handleToggleLightbox}>
                    <div className={globalStyles.slowScaleInOnReveal}>
                      <div className={styles.screenshot}>
                        <div className={styles.screenshotImageWrapper}>
                          <Image
                            src={screenshot}
                            alt="Game Preview Screenshot"
                            fill
                            style={{ objectFit: 'contain' }}
                            sizes="(max-width: 48.375em) 88vw, (max-width: 62em) 68rem, (max-width: 75.0625em) 88rem, (max-width: 90.0625em) 98rem, 104rem"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`${globalStyles.captionWrapper} ${globalStyles.slideInVerticalOnReveal2}`}>
                  <p className={globalStyles.captionText}>Battlepets will be available on</p>
                  <div className={styles.storeLogosWrapper}>
                    <div className={styles.googlePlayLogoWrapper}>
                      <Image
                        src={googlePlayLogo as StaticImport}
                        alt="Google Play logo"
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <div className={styles.appStoreLogoWrapper}>
                      <Image
                        src={appStoreLogo as StaticImport}
                        alt="Apple App Store logo"
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </RevealedSection>
          </div>
          <div className={styles.gameCTA}>
            <RevealedSection>
              <div className={`${styles.sectionContent} ${styles.gameCTASectionContent}`}>
                <CTA
                  heading={
                    <>
                      Get in the <span className={globalStyles.promoText}>BPETS</span> sale and win a{' '}
                      <span className={globalStyles.promoText}>sale-only</span> NFT!
                    </>
                  }
                  ctaText={
                    <>
                      Sign up below for the <strong>BPETS airdrop</strong> and <strong>public sale</strong> at
                      pre&#8209;launch price, where you also get a{' '}
                      <span className={globalStyles.promoText}>limited&#8209;edition</span> <strong>Hellcat</strong>!
                    </>
                  }
                  email={email}
                  onEmailChange={handleEmailChange}
                  image={{
                    data: promoCard,
                    alt: 'Inferno Devil Cat Battlepet Card',
                    wrapperClassName: styles.promoCardImageWrapper,
                  }}
                  hasSignedUp={hasSignedUp}
                  onSuccess={handleSignUpSuccess}
                  inputVariant="promo"
                  buttonVariant="promo"
                  buttonText="Let me in!"
                />
              </div>
            </RevealedSection>
          </div>
          <RevealedSection className={styles.tokenSection}>
            <div id="token" className={styles.sectionTarget} />
            <div className={styles.tokenSectionBackground} />
            <div className={styles.tokenSectionContent}>
              {TOKEN_METRICS.map(({ caption, value }, index) => (
                <div
                  key={value}
                  className={`${styles.tokenMetric} ${globalStyles[`scaleInOnReveal${index <= 2 ? index + 1 : 3}`]}`}
                >
                  <div className={styles.tokenValue}>{value}</div>
                  <div className={globalStyles.captionText}>{caption}</div>
                </div>
              ))}
            </div>
          </RevealedSection>
          <RevealedSection className={styles.roadmapSection}>
            <div id="roadmap" className={styles.sectionTarget} />
            <div className={`${styles.sectionContent} ${styles.roadmapSectionContent}`}>
              <div className={styles.roadmapSectionHeader}>
                <h3 className={globalStyles.slideInVerticalOnReveal1}>Roadmap</h3>
                <Link href={LITEPAPER_URL} target="_blank" rel="noopener noreferrer nofollow">
                  <Button asDiv className={styles.headerActionButton}>
                    Read Litepaper
                  </Button>
                </Link>
              </div>
              <div className={styles.roadmapWrapper}>
                <div className={styles.roadmap}>
                  <svg viewBox="0 0 1280 160" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M 0 60 Q 320 120, 640 60 T 1280 60"
                      strokeWidth={6}
                      strokeOpacity={0.85}
                      fill="transparent"
                    />
                    <path
                      d="M 0 60 Q 320 120, 640 60 T 1280 60"
                      strokeWidth={6}
                      strokeOpacity={0.85}
                      fill="transparent"
                      strokeDasharray="128 1280"
                    />
                  </svg>
                  {ROADMAP_POINTS.map(({ heading, items }, index) => (
                    <div key={heading} className={styles.roadmapPointWrapper}>
                      <div className={`${styles.roadmapPointOnReveal} ${globalStyles[`scaleInOnReveal${index + 1}`]}`}>
                        <div className={styles.roadmapPointScaler}>
                          <div className={styles.roadmapPoint} />
                        </div>
                      </div>
                      <div className={styles.roadmapPointText}>
                        <p className={styles.roadmapPointTextHeading}>{heading}</p>
                        <ul className={styles.roadmapPointTextItems}>
                          {items.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.roadmapMobileCTAWrapper}>
                <Link href={LITEPAPER_URL} target="_blank" rel="noopener noreferrer nofollow">
                  <Button asDiv>Read Litepaper</Button>
                </Link>
              </div>
              <CTA
                heading="Want to stay in the loop?"
                ctaText={
                  <>
                    Join the waitlist to get the <strong>BPETS airdrop</strong> and sign up for our{' '}
                    <strong>public sale</strong> at pre-launch price!
                  </>
                }
                email={email}
                onEmailChange={handleEmailChange}
                hasSignedUp={hasSignedUp}
                onSuccess={handleSignUpSuccess}
                buttonText="Let me know!"
                buttonVariant="fire"
              />
            </div>
          </RevealedSection>
        </main>
        <footer>
          <div className={styles.footerTopBorder} />
          <div className={styles.footerContent}>
            <div className={styles.footerLeft}>
              <Link href="/" className={styles.footerLogoWrapper}>
                <Image
                  src={logo}
                  alt="Battlepets logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 62em) 8.6rem, (max-width: 90.0625em) 10rem, 11rem"
                />
              </Link>
              <Link
                href={`mailto:${CONTACT_EMAIL}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={styles.footerContact}
              >
                {CONTACT_EMAIL}
              </Link>
            </div>
            <nav>
              <ul>
                <li>
                  <Link href="#top">Top</Link>
                </li>
                <li>
                  <Link href="#game">Game</Link>
                </li>
                <li>
                  <Link href="#token">Token</Link>
                </li>
                <li>
                  <Link href="#roadmap">Roadmap</Link>
                </li>
                <li>
                  <Link href={LITEPAPER_URL} target="_blank" rel="noopener noreferrer nofollow">
                    Litepaper
                  </Link>
                </li>
                <li>
                  <Link href={STATUS_URL} target="_blank" rel="noopener noreferrer nofollow">
                    Status
                  </Link>
                </li>
              </ul>
            </nav>
            <div className={styles.footerSocials}>
              <Socials hideCaption />
            </div>
          </div>
          <div className={styles.footerCopyright}>© {new Date().getFullYear()} Battlepets. All rights reserved.</div>
        </footer>
        <Lightbox
          open={isLightboxOpen}
          close={handleToggleLightbox}
          slides={[{ src: screenshot.src, alt: 'Game Preview Screenshot' }]}
          plugins={[LightboxFullscreen, LightboxZoom]}
        />
      </div>
    </>
  )
}

export default Home
