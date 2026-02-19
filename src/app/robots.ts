import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/prijzen', '/onboarding'],
        disallow: ['/dashboard/', '/opdracht/', '/klanten/', '/klant/', '/planning/', '/api/'],
      },
    ],
    sitemap: 'https://vakmanapp.nl/sitemap.xml',
  }
}
