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
          author
        })
      });

      document.head.appendChild(structuredData);
    }
  });
};
