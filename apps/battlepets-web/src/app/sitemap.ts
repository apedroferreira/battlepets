import { BASE_URL } from 'battlepets-shared/constants'
import { MetadataRoute } from 'next'

const sitemap = (): MetadataRoute.Sitemap => [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  },
]

export default sitemap
