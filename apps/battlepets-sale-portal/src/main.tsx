import * as buffer from 'buffer'

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import React, { useMemo } from 'react'
import ReactDOM from 'react-dom/client'

import { App } from '@/App.tsx'
import { getEndpoint } from '@/utils/solanaUtils'

import '@/index.scss'

window.Buffer = buffer.Buffer

const endpoint = getEndpoint()

// eslint-disable-next-line react-refresh/only-export-components
const Main: React.FC = () => {
  const wallets = useMemo(() => [], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
)
