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
    resolveData: ({ url }) =>({
      "@type": "WebSite",
      url,
      name: "Patrick Samson"
    })
  },
  {
    path: "/style-guide",
    resolveData: ({ url, metaTitle, metaDescription }) => ({
      "@type": "WebPage",
      url,
      name: metaTitle,
      description: metaDescription
    })
  },
  {
    path: "/web-development-practices/web-development-basics",
    resolveData: ({ author }) => ({
      "@type": "BlogPosting",
      headline: "Web Development Basics",
      image: "https://cdn.prod.website-files.com/67466020a9ebbbd9ae011f56/68bc162184493c1248f7b5e6_image10.webp",
      datePublished: "2025-09-06",
      dateModified: "2025-09-06",
      author
    })
  },
  {
    path: "/web-development-practices/responsive-design-principles",
    resolveData: ({ author }) => ({
      "@type": "BlogPosting",
      headline: "Responsive Design Principles",
      image: "https://cdn.prod.website-files.com/67466020a9ebbbd9ae011f56/68bc1575011c2b41cbd3fb57_image1.webp",
      datePublished: "2025-09-06",
      dateModified: "2025-09-06",
      author
    })
  },
  {
    path: "/web-development-practices/javascript-for-beginners",
    resolveData: ({ author }) => ({
      "@type": "BlogPosting",
      headline: "JavaScript for Beginners",
      image: "https://cdn.prod.website-files.com/67466020a9ebbbd9ae011f56/68bc162284493c1248f7b5e9_image13.webp",
      datePublished: "2025-09-06",
      dateModified: "2025-09-06",
      author
    })
  },
  {
    path: "/web-development-practices/css-grid-layout",
    resolveData: ({ author }) => ({
      "@type": "BlogPosting",
      headline: "CSS Grid Layout",
      image: "https://cdn.prod.website-files.com/67466020a9ebbbd9ae011f56/68bc1575011c2b41cbd3fb51_image16.webp",
      datePublished: "2025-09-06",
      dateModified: "2025-09-06",
      author
    })
  },
  {
    path: "/web-development-practices/understanding-web-accessibility",
    resolveData: ({ author }) => ({
      "@type": "BlogPosting",
      headline: "Understanding Web Accessibility",
      image: "https://cdn.prod.website-files.com/67466020a9ebbbd9ae011f56/68bc162184493c1248f7b5e3_image7.webp",
      datePublished: "2025-09-06",
      dateModified: "2025-09-06",
      author
    })
  }
]);
