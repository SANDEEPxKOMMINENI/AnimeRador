import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

export function SEO({
  title = 'AnimeRadar - Discover Your Next Favorite Anime',
  description = 'Track, discover, and explore anime with AnimeRadar. Get personalized recommendations, create watchlists, and join the community.',
  image = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
  type = 'website',
}: SEOProps) {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://animeradar.com';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={siteUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="theme-color" content="#6D28D9" />
      <link rel="canonical" href={siteUrl} />
    </Helmet>
  );
}
