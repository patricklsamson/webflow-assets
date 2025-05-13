const runOnDomReady = (callback) => {
  return document.addEventListener("DOMContentLoaded", callback);
};

const injectStylesheets = (stylesheets) => {
  if (stylesheets.length > 0) {
    stylesheets.forEach((stylesheet) => {
      const link = document.createElement("link");

      link.setAttribute("rel", "stylesheet");
      link.setAttribute("href", stylesheet);
      document.head.appendChild(link);
    });
  }
};

const resolveSpans = () => {
  const texts = document.querySelectorAll("[data-span_style]");

  if (texts.length > 0) {
    texts.forEach((text) => {
      const spanClasses = text.dataset.span_style.split("|");
      let index = 0;

      const resolvedText = text.innerHTML.replace(
        /\|([^|]+?)\|/g,
        (_, content) => {
          const spanClass = spanClasses[index];

          if (spanClasses.length > 1) {
            index++;
          }

          if (spanClass) {
            return `<span class="${spanClass}">${content}</span>`;
          }

          return content;
        }
      );

      text.innerHTML = resolvedText;
    });
  }
};

const clickElements = (identifier) => {
  const elements = document.querySelectorAll(identifier);

  if (elements.length > 0) {
    elements.forEach((element) => {
      let isClicked = false;

      element.addEventListener("click", () => {
        isClicked = true;
      }, { once: true });

      element.click();

      if (!isClicked) {
        element.dispatchEvent(new Event("mousedown"));
        element.dispatchEvent(new Event("mouseup"));
      }
    });
  }
};

const openActiveAccordions = () => {
  const accordionHeaders = document.querySelectorAll(
    "[data-active_accordion='true']"
  );

  if (accordionHeaders.length > 0) {
    accordionHeaders.forEach((header) => {
      let isClicked = false;

      header.addEventListener("click", () => {
        isClicked = true;
      }, { once: true });

      header.click();

      if (!isClicked) {
        header.dispatchEvent(new Event("mousedown"));
        header.dispatchEvent(new Event("mouseup"));
      }
    });
  }
};

const initTimeToRead = (
  wordsBefore,
  wordsAfter = "read",
  unit = "min",
  wordsPerMinute = 100
) => {
  const timeSources = document.querySelectorAll("[data-time_source]");

  if (timeSources.length > 0) {
    timeSources.forEach((source) => {
      const words = source.innerText.split(" ").length;
      const images = source.querySelectorAll("img").length;
      const videos = source.querySelectorAll("iframe").length;

      const minutes = Math.floor(
        (words / wordsPerMinute) +
        ((images * 10) / 60) +
        (videos * 3)
      );

      const timeToRead = minutes > 1 ? `${minutes} ${unit}s` : `1 ${unit}`;

      const timeTarget = document.querySelector(
        `[data-time_target="${source.dataset.time_source}"]`
      );

      timeTarget.innerHTML = `${wordsBefore ? `${wordsBefore} ` : ""}${
        timeToRead
      }${wordsAfter ? ` ${wordsAfter}` : ""}`;
    });
  }
};

const initSocialShare = () => {
  const urlSharers = document.querySelectorAll("[data-share_url]");

  if(urlSharers.length > 0) {
    urlSharers.forEach((sharer) => {
      const { share_url, slug } = sharer.dataset;
      const { origin, href } = window.location;
      let socialMediaUrl = null;
      let defaultShare = false;

      switch (share_url) {
        case "facebook":
          socialMediaUrl = "https://www.facebook.com/sharer/sharer.php?u=";

          break;
        case "twitter":
        case "x":
          socialMediaUrl = "https://twitter.com/intent/tweet?url=";

          break;
        case "linkedin":
          socialMediaUrl = "https://www.linkedin.com/sharing/share-offsite/?url=";

          break;
        default:
          if (!socialMediaUrl && !share_url.includes("https")) {
            defaultShare = true;

            sharer.addEventListener("click", function (e) {
              e.preventDefault();

              const { slug } = this.dataset;
              const { origin, href } = window.location;

              navigator.clipboard.writeText(`${
                slug ? `${origin}${slug}` : href
              }`);
            });
          }
      }

      if (!defaultShare) {
        sharer.href = `${
          slug ? `${socialMediaUrl ?? share_url}${origin}${slug}` : href
        }`;

        if (!sharer.target) {
          sharer.target = "_blank";
        }
      }
    });
  }
};

const removeInvisibleElements = () => {
  const invisibleElements = document.querySelectorAll(".w-condition-invisible");

  if (invisibleElements.length > 0) {
    invisibleElements.forEach((element) => {
      element.remove();
    });
  }
};

const requestApi = async (
  url,
  body = null,
  method = "POST",
  headers = { "Content-Type": "application/json" }
) => {
  try {
    if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    if (body && headers["Content-Type"] === "application/json") {
      body = JSON.stringify(body);
    }

    const response = await fetch(url, { method, headers, body });
    const contentType = response.headers.get("Content-Type");
    const data = await response.json();

    if (!response.ok) {
      if (contentType === "application/json") {
        throw new Error(data.message || "Error occurred");
      }

      throw new Error("Error occurred");
    }

    if (response.status === 204) {
      return null;
    }

    return contentType === "application/json" ? data : await response.text();
  } catch (error) {
    throw error;
  }
};

const initFormSubmit = (
  identifier,
  {
    url,
    buildBody,
    method = "POST",
    headers = { "Content-Type": "application/json" },
    customSuccess = null,
    formDisplay = "block",
    displayApiError = false
  }
) => {
  const form = document.getElementById(identifier);

  if (form) {
    if (!form.getAttribute("action")) {
      form.setattribute("action", "/");
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const setDisplay = (element, display = "block", callback = null) => {
        if (element) {
          if (callback) {
            callback();
          }

          element.style.display = display;
        }
      };

      const { elements: inputs, parentNode } = this;
      const loadingMessage = this.querySelector("[data-message='loading']");
      const successMessage = parentNode.querySelector(".w-form-done");
      const errorMessage = parentNode.querySelector(".w-form-fail");

      try {
        setDisplay(loadingMessage, "block");

        const body = JSON.stringify(buildBody(inputs));
        const response = await fetch(url, { method, headers, body });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error occurred");
        }

        setDisplay(this, "none");
        setDisplay(loadingMessage, "none");

        setDisplay(successMessage, "block", () => {
          if (customSuccess) {
            const successMessageBlock = successMessage.querySelector("div");

            if (successMessageBlock) {
              successMessageBlock.innerHTML =
                typeof customSuccess === "string"
                  ? customSuccess
                  : customSuccess(data);
            } else {
              successMessage.innerHTML =
                typeof customSuccess === "string"
                  ? customSuccess
                  : customSuccess(data);
            }
          }
        });

        setDisplay(errorMessage, "none");
      } catch (error) {
        setDisplay(this, formDisplay);
        setDisplay(loadingMessage, "none");
        setDisplay(successMessage, "none");

        setDisplay(errorMessage, "block", () => {
          if (displayApiError) {
            const errorMessageBlock = errorMessage.querySelector("div");

            if (errorMessageBlock) {
              errorMessageBlock.innerHTML = error.message || "Error occurred";
            } else {
              errorMessage.innerHTML = error.message || "Error occurred";
            }
          }
        });

        throw error;
      }
    });
  }
};

const initMediaMatch = (breakpoint, callback) => {
  const media = window.matchMedia(
    `only screen and (${breakpoint >= 0 ? "min" : "max"}-width: ${
      breakpoint >= 0 ? breakpoint : breakpoint * -1
    }px)`
  );

  callback(media);

  window.addEventListener("resize", () => {
    callback(media);
  });

  media.addEventListener("change", callback);
};

const runOnMediaMatch = (breakpoint, onMatch, onUnmatch) => {
  const runOnMatch = (media) => {
    if (media.matches) {
      onMatch && onMatch();
    } else {
      onUnmatch && onUnmatch();
    }
  };

  const media = window.matchMedia(
    `only screen and (${breakpoint >= 0 ? "min" : "max"}-width: ${
      breakpoint >= 0 ? breakpoint : breakpoint * -1
    }px)`
  );

  runOnMatch(media);

  window.addEventListener("resize", () => {
    runOnMatch(media);
  });

  media.addEventListener("change", runOnMatch);
};

const initMasonry = (identifier, config, breakpoint) => {
  let masonry = null;

  const resolveConfig = (config) => {
    config.container = identifier;
    config.surroundingGutter = config.surroundingGutter ?? false;
    config.minify = config.minify ?? false;
    config.wedge = config.wedge ?? true;

    return config;
  };

  if (breakpoint) {
    const runOnMatch = (media) => {
      if (media.matches && !masonry) {
        const resolvedConfig = resolveConfig(config);

        masonry = new MiniMasonry(resolvedConfig);
      }

      if (!media.matches && masonry) {
        masonry.destroy();
        masonry = null;
      }
    };

    const media = window.matchMedia(
      `only screen and (${breakpoint >= 0 ? "min" : "max"}-width: ${
        breakpoint >= 0 ? breakpoint : breakpoint * -1
      }px)`
    );

    runOnMatch(media);

    window.addEventListener("resize", () => {
      runOnMatch(media);
    });

    media.addEventListener("change", runOnMatch);
  } else {
    const resolvedConfig = resolveConfig(config);

    masonry = new MiniMasonry(resolvedConfig);
  }
};

const initSlider = (identifier, config, breakpoint) => {
  let slider = null;

  if (breakpoint) {
    const runOnMatch = (media) => {
      if (media.matches && !slider) {
        config.init = false;
        slider = new Swiper(identifier, config);
        slider.init();
      }

      if (!media.matches && slider) {
        slider.destroy();
        slider = null;
      }
    };

    const media = window.matchMedia(
      `only screen and (${breakpoint >= 0 ? "min" : "max"}-width: ${
        breakpoint >= 0 ? breakpoint : breakpoint * -1
      }px)`
    );

    runOnMatch(media);

    window.addEventListener("resize", () => {
      runOnMatch(media);
    });

    media.addEventListener("change", runOnMatch);
  } else {
    slider = new Swiper(identifier, config);
  }
};

const resolveSliderHeight = (swiper) => {
  const params = swiper.params;

  if (params.direction && params.direction === "vertical") {
    const slidesPerView = params.slidesPerView || 1;
    const activeIndex = params.loop ? swiper.realIndex : swiper.activeIndex;
    let height = 0;
    let index = activeIndex + (slidesPerView - 1);

    while (index >= activeIndex) {
      if (index < swiper.slides.length) {
        height += swiper.slides[index].firstChild.offsetHeight;
      }

      index--;
    }

    const spaceBetween = params.spaceBetween;

    if (spaceBetween && slidesPerView && (slidesPerView > 1)) {
      height += (spaceBetween * slidesPerView);
    }

    swiper.el.style.height = `${height}px`;
  } else {
    swiper.el.style.height = "auto";
  }
};

const removeSliderTransform = (swiper, targetIdentifier) => {
  swiper.slides.forEach((slide) => {
    const targetElement = targetIdentifier
      ? slide.querySelector(targetIdentifier)
      : slide;

    if (!targetElement.classList.contains("init-transform-remover")) {
      targetElement.classList.add("init-transform-remover");

      targetElement.addEventListener("click", () => {
        slide.classList.toggle("transform-none");
        swiper.wrapperEl.classList.toggle("transform-none");
      });
    }
  });
};

const runAfterFinsweet = (attributeModules, callback, onRenderCallback) => {
  window.fsAttributes = window.fsAttributes || [];

  const attributeFlag = attributeModules.reduce((init, attributeModule) => {
    init[attributeModule] = false;

    return init;
  }, {});

  for (const attributeModule of attributeModules) {
    window.fsAttributes.push([
      attributeModule,
      (instances) => {
        attributeFlag[attributeModule] = true;

        const allModulesRendered = Object.values(
          attributeFlag
        ).every((flag) => flag);

        if (allModulesRendered) {
          if (callback) {
            callback();
          }

          if (onRenderCallback) {
            for (const instance of instances) {
              if (instance.listInstance) {
                instance.listInstance.on("renderitems", (renderedItems) => {
                  onRenderCallback();
                });
              }
            }
          }
        }
      }
    ]);
  }
};

const resetWebflowAfterWized = (onEndRequests, onceRequests) => {
  const resetWebflow = () => {
    const webflow = window.Webflow;

    if (webflow) {
      webflow.destroy();
      webflow.ready();
      webflow.require("ix2").init();
      document.dispatchEvent(new Event("readystatechange"));
    }
  };

  window.Wized = window.Wized || [];

  window.Wized.push(async (Wized) => {
    if (onEndRequests && onEndRequests.length > 0) {
      Wized.on("requestend", ({ name }) => {
        if (onEndRequests.some((request) => request === name)) {
          resetWebflow();
        }
      });
    }

    if (onceRequests && onceRequests.length > 0) {
      for (const request of onceRequests) {
        await Wized.requests.waitFor(request);
      }

      resetWebflow();
    }
  });
};
