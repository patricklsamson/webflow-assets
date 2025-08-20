const setStructuredData = (pages) => {
  pages.forEach((page) => {
    const { pathname, href } = window.location;

    if (pathname === page.path) {
      const structuredData = document.createElement("script");

      structuredData.type = "application/ld+json";

      const author = {
        "@type": "Person",
        name: "Patrick Samson"
      };

      structuredData.innerHTML = JSON.stringify({
        "@content": "https://schema.org",
        ...page.resolveData({
          url: href,
          metaTitle: document.title,
          metaDescription: document.querySelector(
            "meta[name='description']"
          ).getAttribute("content"),
          mainEntity: {
            ...author,
            url: href,
            logo: {
              "@type": "ImageObject",
              url: "https://cdn.prod.website-files.com/66944bbc65c60d35578879e7/66944bbc65c60d3557887a55_client-first-logo-white.svg",
              width: 229,
              height: 49
            }
          },
          author,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": href
          }
        })
      });

      document.head.appendChild(structuredData);
    }
  });
};
