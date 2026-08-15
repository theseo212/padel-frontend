export default function sitemap() {
  const baseUrl = 'https://www.annapadel.it';
  const oggi = new Date();

  return [
    {
      url: baseUrl,
      lastModified: oggi,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: oggi,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contatti`,
      lastModified: oggi,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/termini`,
      lastModified: oggi,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: oggi,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
