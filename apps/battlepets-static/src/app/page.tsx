import Image from 'next/image'
import Link from 'next/link'

import { CONTACT_EMAIL, LITEPAPER_URL } from '@/common/constants'
import globalStyles from '@/common/global.module.scss'
import { Button } from '@/components/Button'
import { CTA } from '@/components/CTA'
import { Input } from '@/components/Input'
import { Socials } from '@/components/Socials'

import appStoreLogo from '../../public/images/appstorelogo.svg'
import battlePet1 from '../../public/images/battlepet1.png'
import battlePet2 from '../../public/images/battlepet2.png'
import battlePet3 from '../../public/images/battlepet3.png'
import card1 from '../../public/images/card1.png'
import card2 from '../../public/images/card2.png'
import card3 from '../../public/images/card3.png'
import fireDecoration from '../../public/images/firedecoration.png'
import googlePlayLogo from '../../public/images/googleplaylogo.svg'
import iceDecoration from '../../public/images/icedecoration.png'
import logo from '../../public/images/logo.png'
import solanaLogo from '../../public/images/solanalogo.svg'
import token from '../../public/images/token.png'

import styles from './page.module.scss'

const TOKEN_METRICS: { value: string; caption: React.ReactNode }[] = [
  {
    value: '10M',
    caption: (
      <>
        Total <strong>$BPETS</strong> supply
      </>
    ),
  },
  {
    value: '$0.12',
    caption: 'Public sale price',
  },
  {
    value: '$696K',
    caption: 'Public sale market cap',
  },
]

/* eslint-disable react/jsx-key */
const ROADMAP_POINTS: { heading: string; items: React.ReactNode[] }[] = [
  {
    heading: 'Q1 2024',
    items: [
      <strong>Airdrop</strong>,
      <strong>Public Sale</strong>,
      <>
        <strong>$BPETS</strong> Launch
      </>,
    ],
  },
  {
    heading: 'Q2-Q3 2024',
    items: ['BattlePets DAO', 'Create Series 1 cards', 'App development'],
  },
  {
    heading: 'Q4 2024',
    items: ['Beta App launch'],
  },
  {
    heading: 'Q1 2025',
    items: ['Public App launch'],
  },
]
/* eslint-enable react/jsx-key */

const Home = () => (
  <>
    <header>
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.headerLogoWrapper}>
            <Image src={logo} alt="BattlePets logo" fill style={{ objectFit: 'contain' }} />
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
          <Button>Read Litepaper</Button>
        </Link>
      </div>
    </header>
    <main>
      <div className={styles.intro}>
        <div className={styles.introFireBackground} />
        <div className={styles.introIceBackground} />
        <section className={styles.hero}>
          <div className={styles.sectionContent}>
            <h1>
              <span className={globalStyles.fireText}>Ready</span> To{' '}
              <span className={globalStyles.iceText}>Battle</span>?
            </h1>
            <div className={styles.heroContent}>
              <p className={styles.heroText}>
                Join the waitlist to get the <strong>$BPETS</strong>{' '}
                <span className={globalStyles.iceText}>airdrop</span> and sign up for our{' '}
                <span className={globalStyles.fireText}>public sale</span> at an exclusive price!
              </p>
              <form className={styles.heroSignUpForm}>
                <Input type="email" placeholder="Enter your email" />
                <Button variant="fire">I&apos;m in!</Button>
              </form>
            </div>
            <div className={styles.heroCaptions}>
              <div className={globalStyles.captionContainer}>
                <p className={globalStyles.captionText}>Soon on</p>
                <div className={styles.solanaLogoWrapper}>
                  <Image src={solanaLogo} alt="Solana logo" fill style={{ objectFit: 'contain' }} />
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
              <div className={styles.heroIceDecorationWrapper}>
                <Image src={iceDecoration} alt="Ice decoration" fill style={{ objectFit: 'contain' }} />
              </div>
              <div className={styles.heroIcePortal}>
                <div className={styles.heroIcePortalScene} />
              </div>
            </div>
            <div className={styles.heroFireImageWrapper}>
              <div className={styles.heroFireDecorationWrapper}>
                <Image src={fireDecoration} alt="Fire decoration" fill style={{ objectFit: 'contain' }} />
              </div>
              <div className={styles.heroFirePortal}>
                <div className={styles.heroFirePortalScene} />
              </div>
            </div>
            <div className={styles.heroPet1Wrapper}>
              <Image src={battlePet1} alt="Samurai BattlePet" fill style={{ objectFit: 'contain' }} />
            </div>
            <div className={styles.heroPet2Wrapper}>
              <Image src={battlePet2} alt="Soldier BattlePet" fill style={{ objectFit: 'contain' }} />
            </div>
            <div className={styles.heroPet3Wrapper}>
              <Image src={battlePet3} alt="Secret Agent BattlePet" fill style={{ objectFit: 'contain' }} />
            </div>
          </div>
        </section>
        <section>
          <div id="game" className={styles.sectionTarget} />
          <div className={`${styles.sectionContent} ${styles.featuresSectionContent}`}>
            <h2>
              <span className={globalStyles.fireText}>Play to earn</span> in a deck builder,{' '}
              <span className={globalStyles.iceText}>auto battler</span> game!
            </h2>
            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureImageWrapper1}>
                  <Image src={card1} alt="BattlePets card" fill style={{ objectFit: 'contain' }} />
                </div>
                <h5>Collect</h5>
                <p>Collect NFT battle cards with different pets and rarities to build your deck!</p>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureImageWrapper2}>
                  <div className={styles.featureBattleFirePortal}>
                    <div className={styles.featureBattleIcePortal} />
                    <div className={styles.featureBattlePortalScene} />
                    <div className={styles.featureBattleCard2Wrapper}>
                      <Image src={card2} alt="Soldier BattlePet card" fill style={{ objectFit: 'contain' }} />
                    </div>
                    <div className={styles.featureBattleCard3Wrapper}>
                      <Image src={card3} alt="Samurai BattlePet card" fill style={{ objectFit: 'contain' }} />
                    </div>
                  </div>
                </div>
                <h5>Battle</h5>
                <p>Battle against other players to win rewards, including new cards!</p>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureImageWrapper3}>
                  <Image src={token} alt="$BPETS token" fill style={{ objectFit: 'contain' }} />
                </div>
                <h5>Invest</h5>
                <p>
                  Invest in the game and get exclusive benefits with the <strong>$BPETS</strong> token!
                </p>
              </div>
            </div>
            <div className={globalStyles.captionContainer}>
              <p className={globalStyles.captionText}>BattlePets will be available on</p>
              <div className={styles.storeLogosWrapper}>
                <div className={styles.googlePlayLogoWrapper}>
                  <Image src={googlePlayLogo} alt="Google Play logo" fill style={{ objectFit: 'contain' }} />
                </div>
                <div className={styles.appStoreLogoWrapper}>
                  <Image src={appStoreLogo} alt="Apple App Store logo" fill style={{ objectFit: 'contain' }} />
                </div>
              </div>
            </div>
            <CTA heading="Get $BPETS early with a discount!" buttonText="Let me in!" />
          </div>
        </section>
      </div>
      <section className={styles.tokenSection}>
        <div id="token" className={styles.sectionTarget} />
        <div className={styles.tokenSectionBackground} />
        <div className={styles.tokenSectionContent}>
          {TOKEN_METRICS.map(({ caption, value }) => (
            <div key={value} className={styles.tokenMetric}>
              <div className={styles.tokenValue}>{value}</div>
              <div className={globalStyles.captionText}>{caption}</div>
            </div>
          ))}
        </div>
      </section>
      <section className={styles.roadmapSection}>
        <div id="roadmap" className={styles.sectionTarget} />
        <div className={`${styles.sectionContent} ${styles.roadmapSectionContent}`}>
          <div className={styles.roadmapSectionHeader}>
            <h3>Roadmap</h3>
            <Link href={LITEPAPER_URL} target="_blank" rel="noopener noreferrer nofollow">
              <Button>Read Litepaper</Button>
            </Link>
          </div>
          <div className={styles.roadmap}>
            <svg viewBox="0 0 1280 160" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 0 60 Q 320 120, 640 60 T 1280 60"
                stroke="black"
                strokeWidth={6}
                strokeOpacity={0.75}
                fill="transparent"
              />
            </svg>
            {ROADMAP_POINTS.map(({ heading, items }) => (
              <div key={heading} className={styles.roadmapPointWrapper}>
                <div className={styles.roadmapPointScaler}>
                  <div className={styles.roadmapPoint} />
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
          <CTA heading="Want to stay in the loop?" buttonText="Keep me updated!" buttonVariant="fire" />
        </div>
      </section>
    </main>
    <footer>
      <div className={styles.footerTopBorder} />
      <div className={styles.footerContent}>
        <div className={styles.footerLeft}>
          <Link href="/" className={styles.footerLogoWrapper}>
            <Image src={logo} alt="BattlePets logo" fill style={{ objectFit: 'contain' }} />
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
              <Link href="#top">Back to top</Link>
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
          </ul>
        </nav>
        <div className={styles.footerSocials}>
          <Socials hideCaption />
        </div>
      </div>
      <div className={styles.footerCopyright}>© {new Date().getFullYear()} BattlePets. All rights reserved.</div>
    </footer>
  </>
)

export default Home
