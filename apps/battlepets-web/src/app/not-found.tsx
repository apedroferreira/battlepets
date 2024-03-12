import Link from 'next/link'

import globalStyles from '@/common/global.module.scss'
import { Button } from '@/components/Button'

const NotFound = () => (
  <div className={globalStyles.genericPage}>
    <h3>Page Not Found</h3>
    <p>The page you’re looking for does not exist…</p>
    <Link href="/">
      <Button>Go To Home Page</Button>
    </Link>
  </div>
)

export default NotFound
