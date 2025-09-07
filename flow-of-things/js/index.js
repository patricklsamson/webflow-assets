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
      image: "https://cdn.prod.website-files.com/67466020a9ebbbd9ae011f56/68bc162184493c1248f7b5e6_image10.webp",
      author,
      publisher: mainEntity,
      datePublished: "2025-09-06",
      dateModified: "2025-09-06",
      mainEntityOfPage
    })
  },
  {
    path: "/web-development-practices/responsive-design-principles",
    resolveData: ({
      metaDescription,
      mainEntity,
      author,
      mainEntityOfPage
    }) => ({
      "@type": "BlogPosting",
      headline: "Responsive Design Principles",
      description: metaDescription,
      image: "https://cdn.prod.website-files.com/67466020a9ebbbd9ae011f56/68bc1575011c2b41cbd3fb57_image1.webp",
      author,
      publisher: mainEntity,
      datePublished: "2025-09-06",
      dateModified: "2025-09-06",
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
      image: "https://cdn.prod.website-files.com/67466020a9ebbbd9ae011f56/68bc162284493c1248f7b5e9_image13.webp",
      author,
      publisher: mainEntity,
      datePublished: "2025-09-06",
      dateModified: "2025-09-06",
      mainEntityOfPage
    })
  },
  {
    path: "/web-development-practices/css-grid-layout",
    resolveData: ({
      metaDescription,
      mainEntity,
      author,
      mainEntityOfPage
    }) => ({
      "@type": "BlogPosting",
      headline: "CSS Grid Layout",
      description: metaDescription,
      image: "https://cdn.prod.website-files.com/67466020a9ebbbd9ae011f56/68bc1575011c2b41cbd3fb51_image16.webp",
      author,
      publisher: mainEntity,
      datePublished: "2025-09-06",
      dateModified: "2025-09-06",
      mainEntityOfPage
    })
  },
  {
    path: "/web-development-practices/understanding-web-accessibility",
    resolveData: ({
      metaDescription,
      mainEntity,
      author,
      mainEntityOfPage
    }) => ({
      "@type": "BlogPosting",
      headline: "Understanding Web Accessibility",
      description: metaDescription,
      image: "https://cdn.prod.website-files.com/67466020a9ebbbd9ae011f56/68bc162184493c1248f7b5e3_image7.webp",
      author,
      publisher: mainEntity,
      datePublished: "2025-09-06",
      dateModified: "2025-09-06",
      mainEntityOfPage
    })
  }
]);
