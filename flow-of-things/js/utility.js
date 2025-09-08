const setStructuredData = (pages) => {
  pages.forEach((page) => {
    const { pathname, href, origin } = window.location;

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
          publisher: {
            ...author,
            "@id": `${origin}/#organization`,
            url: origin,
            logo: "https://cdn.prod.website-files.com/66944bbc65c60d35578879e7/66944bbc65c60d3557887a55_client-first-logo-white.svg"
          },
          mainEntity: {
            "@id": `${origin}/#organization`
          },
          author
        })
      });

      document.head.appendChild(structuredData);
    }
  });
};
