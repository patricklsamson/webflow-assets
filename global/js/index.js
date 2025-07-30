const injectSourceCodes = (sourceCodes) => {
  if (sourceCodes.length > 0) {
    sourceCodes.forEach((sourceCode) => {
      const { type, url, location } = sourceCode;
      const domTarget = document[location ? location : "head"];

      if (type === "css") {
        const link = document.createElement("link");

        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", url);
        domTarget.appendChild(link);
      } else {
        const script = document.createElement("script");

        script.setAttribute("src", url);
        domTarget.appendChild(script);
      }
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

          return spanClass
            ? `<span class="${spanClass}">${content}</span>`
            : content;
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

const initBottomAnchors = () => {
  const triggers = document.querySelectorAll("[data-scroll_href]");

  if (triggers.length > 0) {
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", function (e) {
        e.preventDefault();

        const target = document.querySelector(
          `[data-scroll_id="${this.dataset.scroll_href}"]`
        );

        if (target) {
          window.scrollTo({
            top: (
              target.getBoundingClientRect().top + window.scrollY
            ) - window.innerHeight,
            behavior: "smooth",
          });
        }
      });
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
          slug ? `${socialMediaUrl || share_url}${origin}${slug}` : href
        }`;

        if (!sharer.target) {
          sharer.target = "_blank";
        }
      }
    });
  }
};

const removeInvisibleElements = () => {
  const invisibleElements = document.querySelectorAll(
    ".w-condition-invisible"
  );

  if (invisibleElements.length > 0) {
    invisibleElements.forEach((element) => {
      element.remove();
    });
  }
};

const requestApi = async (
  url,
  {
    loaderIdentifier,
    callback = null,
    body = null,
    method = "POST",
    headers = { "Content-Type": "application/json" }
  }
) => {
  const setLoaderDisplay = (show) => {
    if (loaderIdentifier) {
      const loader = document.getElementById(loaderIdentifier);

      if (loader) {
        if (show) {
          loader.classList.remove("hide");
        } else {
          loader.classList.add("hide");
        }
      }
    }
  };

  try {
    if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const params = body && headers["Content-Type"] === "application/json"
      ? { method, headers, body: JSON.stringify(body) }
      : { method, headers };

    setLoaderDisplay(true);

    const response = await fetch(url, params);
    const contentType = response.headers.get("Content-Type");

    if (!response.ok) {
      if (contentType === "application/json") {
        const data = await response.json();

        throw new Error(data.message || "Error occurred");
      }

      throw new Error("Error occurred");
    }

    const data = response.status === 204
      ? null
      : contentType === "application/json"
        ? await response.json()
        : await response.text();

    if (callback) {
      callback(data);
    }

    setLoaderDisplay();
  } catch (error) {
    setLoaderDisplay();

    throw error;
  }
};

const validateFields = (form, schema) => {
  const { elements } = form;
  let hasError = false;

  for (const input of elements) {
    const validations = schema[input.id];

    if (validations) {
      for (const { validate, message } of validations) {
        hasError = validate();

        const errorMessage = document.querySelector(
          `[data-field_error="${input.id}"]`
        );

        if (errorMessage) {
          if (hasError) {
            const messageBlock = errorMessage.querySelector(
              "div"
            ) || errorMessage;

            messageBlock.innerHTML = message;
            errorMessage.classList.remove("hide");

            break;
          } else {
            errorMessage.classList.add("hide");
          }
        }
      }
    }
  }

  return hasError;
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
    displayApiError = false,
    schema = null
  }
) => {
  const element = document.getElementById(identifier);

  if (element) {
    const requestApi = async (form, isForm) => {
      const { elements: inputs, parentNode } = form;

      const loadingMessage = parentNode.querySelector(
        "[data-message='loading']"
      );

      const successMessage = parentNode.querySelector(".w-form-done");
      const errorMessage = parentNode.querySelector(".w-form-fail");

      const setDisplay = (element, display = "block", callback = null) => {
        if (element) {
          if (callback) {
            const message = element.querySelector("div") || element;

            callback(message);
          }

          if (isForm) {
            element.style.display = display;
          }
        }
      };

      try {
        const body = JSON.stringify(buildBody(inputs));

        loadingMessage.classList.remove("hide");

        const response = await fetch(url, { method, headers, body });

        if (!response.ok) {
          if (response.headers.get("Content-Type") === "application/json") {
            const data = await response.json();

            throw new Error(data.message || "Error occurred");
          }

          throw new Error("Error occurred");
        }

        const data = response.status === 204 ? null : await response.json();

        setDisplay(form, "none");
        loadingMessage.classList.add("hide");

        setDisplay(successMessage, "block", (message) => {
          if (customSuccess) {
            message.innerHTML = typeof customSuccess === "string"
              ? customSuccess
              : customSuccess(data);
          }
        });

        setDisplay(errorMessage, "none");

        if (!isForm) {
          form.submit();
        }
      } catch (error) {
        setDisplay(form, formDisplay);
        loadingMessage.classList.add("hide");
        setDisplay(successMessage, "none");

        setDisplay(errorMessage, "block", (message) => {
          if (displayApiError) {
            message.innerHTML = error.message || "Error occurred";
          }
        });

        throw error;
      }
    };

    if (element.tagName === "FORM") {
      if (!element.getAttribute("action")) {
        element.setattribute("action", "/");
      }

      element.addEventListener("submit", function (e) {
        e.preventDefault();
        requestApi(this, true);
      });
    } else {
      element.addEventListener("click", (e) => {
        e.preventDefault();

        const form = element.closest("form");

        if (schema) {
          const hasError = validateFields(form, schema);

          if (hasError) {
            return false;
          }
        }

        requestApi(form, false);
      });
    }
  }
};

const lazyLoadAssets = () => {
  const assets = Array.from(document.querySelectorAll('[data-lazy="true"]'));

  if (assets.length > 0) {
    if ("IntersectionObserver" in window) {
      const assetObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (entry.target.tagName === "VIDEO") {
                for (const source of entry.target.children) {
                  source.src = source.dataset.src;
                }

                entry.target.load();
              }

              if (entry.target.tagName === "DIV") {
                entry.target.style.backgroundImage = `url(${
                  entry.target.dataset.src
                })`;
              }

              entry.target.removeAttribute("data-lazy");
              observer.unobserve(entry.target);
            }
          });
        }
      );

      assets.forEach((asset) => {
        assetObserver.observe(asset);
      });
    } else {
      const loadAssets = () => {
        assets.forEach((asset) => {
          const rect = asset.getBoundingClientRect();

          if (
            rect.top < window.innerHeight && rect.bottom > 0 &&
            rect.left < window.innerWidth && rect.right > 0
          ) {
            if (asset.tagName === "VIDEO") {
              for (const source of asset.children) {
                source.src = source.dataset.src;
              }

              asset.load();
            }

            if (asset.tagName === "DIV") {
              asset.style.backgroundImage = `url(${asset.dataset.src})`;
            }

            asset.removeAttribute("data-lazy");
          }
        });
      };

      loadAssets();
      window.addEventListener("scroll", loadAssets);
      window.addEventListener("resize", loadAssets);
      window.addEventListener("orientationchange", loadAssets);
    }
  }
};

const initMediaMatch = (breakpoint, onMatch, onUnmatch) => {
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

const initMasonry = (identifier, configSet, initBreakpoint) => {
  const resolveConfig = (config, previousConfig) => {
    config.container = identifier;

    if (config.surroundingGutter === undefined) {
      config.surroundingGutter = false;
    }

    if (config.minify === undefined) {
      config.minify = false;
    }

    if (config.wedge === undefined) {
      config.wedge = true;
    }

    return previousConfig ? { ...previousConfig, ...config } : config;
  };

  const handleInitMasonry = () => {
    const masonries = [];

    if (configSet.baseWidth) {
      const resolvedConfig = resolveConfig(configSet);
      let masonry = null;

      masonry = new MiniMasonry(resolvedConfig);
      masonries.push(masonry);
    } else {
      const breakpoints = Object.keys(configSet);

      for (const [index, breakpoint] of breakpoints.entries()) {
        let masonry = null;

        const previousConfig = Object.values(configSet).reduce(
          (init, item, i) => {
            if (i <= index) {
              return { ...init, ...item };
            }

            return init;
          },
          {}
        );

        const runOnMatch = (media) => {
          if (media.matches && !masonry) {
            const resolvedConfig = resolveConfig(
              configSet[breakpoint],
              previousConfig
            );

            masonry = new MiniMasonry(resolvedConfig);
            masonries[index] = masonry;
          }

          if (!media.matches && masonry) {
            masonry.destroy();
            masonry = null;
            masonries[index] = masonry;
          }
        };

        const media = window.matchMedia(
          `only screen and (min-width: ${breakpoint}px)`
        );

        runOnMatch(media);

        window.addEventListener("resize", () => {
          runOnMatch(media);
        });

        media.addEventListener("change", runOnMatch);
      }
    }

    return masonries.filter((masonry) => masonry);
  };

  let mainMasonries = null;

  if (initBreakpoint) {
    const initOnMatch = (media) => {
      if (media.matches && !mainMasonries) {
        mainMasonries = handleInitMasonry();
      }

      if (!media.matches && mainMasonries) {
        mainMasonries.forEach((masonry) => masonry.destroy());
        mainMasonries = null;
      }
    };

    const media = window.matchMedia(
      `only screen and (${initBreakpoint >= 0 ? "min" : "max"}-width: ${
        initBreakpoint >= 0 ? initBreakpoint : initBreakpoint * -1
      }px)`
    );

    initOnMatch(media);

    window.addEventListener("resize", () => {
      initOnMatch(media);
    });

    media.addEventListener("change", initOnMatch);
  } else {
    mainMasonries = handleInitMasonry();
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
  const swiperEl = swiper.el;

  if (params.direction && params.direction === "vertical") {
    const swiperSlides = swiper.slides;
    const slidesPerView = params.slidesPerView || 1;
    const activeIndex = swiper[params.loop ? "realIndex" : "activeIndex"];
    let height = 0;
    let index = activeIndex + (slidesPerView - 1);

    while (index >= activeIndex) {
      if (index < swiperSlides.length) {
        height += swiperSlides[index].firstChild.offsetHeight;
      }

      index--;
    }

    const spaceBetween = params.spaceBetween;

    if (spaceBetween && slidesPerView && (slidesPerView > 1)) {
      height += (spaceBetween * slidesPerView);
    }

    swiperEl.style.height = height > 0 ? `${height}px` : "auto";
  } else {
    swiperEl.style.height = "auto";
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

const forceLastSlideActive = (swiper) => {
  swiper.snapGrid = [...swiper.slidesGrid];
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

const runAfterFinsweetV2 = (callback) => {
  window.FinsweetAttributes = window.FinsweetAttributes || [];
  callback(window.FinsweetAttributes);
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
