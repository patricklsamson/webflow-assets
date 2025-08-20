injectSourceCodes([
  {
    type: "stylesheet",
    url: "https://cdn.jsdelivr.net/gh/patricklsamson/webflow-assets@main/global/css/index.min.css"
  },
  {
    type: "stylesheet",
    url:"https://cdn.jsdelivr.net/gh/patricklsamson/webflow-assets@main/flow-of-things/css/index.min.css"
  }
]);

setStructuredData([
  {
    path: "/",
    resolveData: ({ url, metaDescription, mainEntity }) =>({
      "@type": "WebSite",
      name: "Patrick Samson",
      description: metaDescription,
      url,
      mainEntity
    })
  },
  {
    path: "/style-guide",
    resolveData: ({ url, metaTitle, metaDescription, mainEntity }) => ({
      "@type": "WebPage",
      name: metaTitle,
      description: metaDescription,
      url,
      mainEntity
    })
  },
  {
    path: "/web-development-practices/web-accessibility",
    resolveData: ({
      metaDescription,
      mainEntity,
      author,
      mainEntityOfPage
    }) => ({
      "@type": "BlogPosting",
      headline: "Web Accessibility",
      description: metaDescription,
      image: "https://cdn.prod.website-files.com/67466020a9ebbbd9ae011f56/67466c62abb86cbc08aa21a0_image6.avif",
      author,
      publisher: mainEntity,
      datePublished: "2025-04-11",
      dateModified: "2025-04-11",
      mainEntityOfPage
    })
  },
  {
    path: "/web-development-practices/seo-fundamentals",
    resolveData: ({
      metaDescription,
      mainEntity,
      author,
      mainEntityOfPage
    }) => ({
      "@type": "BlogPosting",
      headline: "SEO Fundamentals",
      description: metaDescription,
      image: "https://cdn.prod.website-files.com/67466020a9ebbbd9ae011f56/67466c62abb86cbc08aa219a_image20.avif",
      author,
      publisher: mainEntity,
      datePublished: "2025-04-11",
      dateModified: "2025-04-11",
      mainEntityOfPage
    })
  },
  {
    path: "/web-development-practices/javascript-for-beginners",
    resolveData: ({
      metaDescription,
      mainEntity,
      author,
      mainEntityOfPage
    }) => ({
      "@type": "BlogPosting",
      headline: "JavaScript for Beginners",
      description: metaDescription,
      image: "https://cdn.prod.website-files.com/67466020a9ebbbd9ae011f56/67466c62abb86cbc08aa21a3_image18.avif",
      author,
      publisher: mainEntity,
      datePublished: "2025-04-11",
      dateModified: "2025-04-11",
      mainEntityOfPage
    })
  },
  {
    path: "/web-development-practices/responsive-web-design",
    resolveData: ({
      metaDescription,
      mainEntity,
      author,
      mainEntityOfPage
    }) => ({
      "@type": "BlogPosting",
      headline: "Responsive Web Design",
      description: metaDescription,
      image: "https://cdn.prod.website-files.com/67466020a9ebbbd9ae011f56/67466c62abb86cbc08aa219d_image13.avif",
      author,
      publisher: mainEntity,
      datePublished: "2025-04-11",
      dateModified: "2025-04-11",
      mainEntityOfPage
    })
  },
  {
    path: "/web-development-practices/web-development-basics",
    resolveData: ({
      metaDescription,
      mainEntity,
      author,
      mainEntityOfPage
    }) => ({
      "@type": "BlogPosting",
      headline: "Web Development Basics",
      description: metaDescription,
      image: "https://cdn.prod.website-files.com/67466020a9ebbbd9ae011f56/67466c62abb86cbc08aa2197_image1.avif",
      author,
      publisher: mainEntity,
      datePublished: "2025-04-11",
      dateModified: "2025-04-11",
      mainEntityOfPage
    })
  }
]);
