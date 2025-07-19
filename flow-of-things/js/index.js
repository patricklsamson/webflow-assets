injectSourceCodes([
  {
    type: "css",
    url: "https://cdn.jsdelivr.net/gh/patricklsamson/webflow-assets@main/global/css/index.min.css"
  },
  {
    type: "css",
    url:"https://cdn.jsdelivr.net/gh/patricklsamson/webflow-assets@main/flow-of-things/css/index.min.css"
  }
]);

const setStructuredData = (pages) => {
  pages.forEach((page) => {
    if (window.location.pathname === page.path) {
      const structuredData = document.createElement("script");

      structuredData.type = "application/ld+json";

      const author = {
        "@type": "Person",
        name: "Patrick Samson"
      };

      structuredData.innerHTML = JSON.stringify({
        "@content": "https://schema.org",
        ...page.resolveData({
          url: window.location.href,
          metaTitle: document.title,
          metaDescription: document.querySelector(
            "meta[name='description']"
          ).getAttribute("content"),
          mainEntity: {
            ...author,
            url,
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
            "@id": window.location.href
          }
        })
      });

      document.head.appendChild(structuredData);
    }
  });
};

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

runOnDomReady(() => {
  const setScript = (initial) => {
    const selectors = document.querySelectorAll('[data-input="selector"]');
    const script = document.getElementById("script");

    if (script) {
      const code = script.querySelector("code");

      code.innerHTML = "";

      if (selectors.length > 0) {
        selectors.forEach((selector) => {
          if (initial && selector.dataset.checked === "true") {
            selector.checked = true;
          }

          const utilityFunction = document.querySelector(
            `[data-script="${selector.id}"]`
          );

          code.innerHTML += selector.checked
            ? `${utilityFunction.innerText.trim()},`
            : "";
        });
      }

      code.innerHTML = code.innerText.length > 0
        ? `const ${code.innerText.slice(0, -1)};`
        : "None selected";
    }
  };

  setScript(true);

  const selectors = document.querySelectorAll('[data-input="selector"]');

  if (selectors.length > 0) {
    selectors.forEach((selector) => {
      selector.addEventListener("change", function () {
        setScript();
      });
    });
  }

  const buttons = document.querySelectorAll("[data-button]");

  if (buttons.length > 0) {
    buttons.forEach((button) => {
      if (button.dataset.button === "check-default") {
        button.addEventListener("click", function () {
          selectors.forEach((selector) => {
            selector.checked = selector.dataset.checked === "true";
          });

          setScript();
        });

        const clickButton = setInterval(() => {
          button.click();
          button.dispatchEvent(new Event("mousedown"));
          button.dispatchEvent(new Event("mouseup"));

          const script = document.getElementById("script").querySelector(
            "code"
          );

          if (
            script.innerText.length > 0 &&
            !script.innerText.includes("None")
          ) {
            clearInterval(clickButton);
            console.log("Cleared");
          }
        }, 500);
      }

      if (button.dataset.button.includes("all")) {
        button.addEventListener("click", function () {
          selectors.forEach((selector) => {
            selector.checked = this.dataset.button === "check-all";
          });

          setScript();
        });
      }

      if (button.dataset.button === "copy") {
        button.addEventListener("click", function () {
          const script = document.getElementById("script").querySelector(
            "code"
          );

          navigator.clipboard.writeText(script.innerText);
          this.innerText = "Copied!";

          setTimeout(() => {
            this.innerText = "Copy";
          }, 500);
        });
      }
    });
  }
});
