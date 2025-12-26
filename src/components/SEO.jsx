import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title = 'Encircle Net - The Most Engaging Social Media Platform | Earn While You Share',
  description = 'Join Encircle Net, the #1 high engagement social media platform where creators earn real money. Share content, build your circle, and monetize your influence with tips, subscriptions, and referrals. The future of social media is here.',
  keywords = 'social media platform, high engagement social media, best social media app, earn money social media, content creator platform, monetize social media, influencer platform, social networking, CircleValue, premium social media, creator economy, social media earnings, engagement platform, viral content platform',
  image = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&h=630&fit=crop',
  url = 'http://encirclenet.net',
  type = 'website'
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Encircle Net",
    "applicationCategory": "SocialNetworkingApplication",
    "description": description,
    "url": url,
    "image": image,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "15000",
      "bestRating": "5"
    },
    "operatingSystem": "Web, iOS, Android",
    "author": {
      "@type": "Organization",
      "name": "Encircle Net",
      "url": url
    },
    "featureList": [
      "Monetize your content",
      "Real-time engagement",
      "Creator subscriptions",
      "Referral earnings",
      "Premium circles",
      "Live video streaming",
      "Direct messaging",
      "Gamification rewards"
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Encircle Net" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="1 days" />
      <meta name="author" content="Encircle Net" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      
      {/* Mobile Optimization */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="theme-color" content="#9333EA" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}