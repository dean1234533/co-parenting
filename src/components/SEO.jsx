import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://js-grw-up.com';
const DEFAULT_IMAGE = `${BASE_URL}/icons/icon-512x512.png`;
const SITE_NAME = 'Js-Grw-Up';
const DEFAULT_DESCRIPTION = 'Js-Grw-Up is the private co-parenting app for separated parents. Share a calendar, message safely, track expenses and export your records — all in one place.';

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  noIndex = false,
  image = DEFAULT_IMAGE,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Co-parenting made calmer`;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="512" />
      <meta property="og:image:height" content="512" />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
