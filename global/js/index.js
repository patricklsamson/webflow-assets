const injectSourceCodes = (sourceCodes) => {
  if (sourceCodes.length > 0) {
    sourceCodes.forEach((sourceCode) => {
      const { type, url, location } = sourceCode;
      const domTarget = document[location ? location : "head"];

      if (type === "stylesheet") {
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
      const { time_video, time_source } = source.dataset;

      const minutes = Math.floor(
        (words / wordsPerMinute) +
        ((images * 10) / 60) +
        (time_video ? parseInt(time_video) : videos * 4)
      );

      const timeToRead = minutes > 1 ? `${minutes} ${unit}s` : `1 ${unit}`;

      const timeTarget = document.querySelector(
        `[data-time_target="${time_source}"]`
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
  const validations = [true];

  for (const field of elements) {
    const fieldRules = schema[field.name];

    if (fieldRules) {
      const fields = Array.from(
        document.querySelectorAll(`[name="${field.name}"]`)
      );

      for (const { validate, message } of fieldRules) {
        const isValid = validate(field, fields);

        validations.push(isValid);

        const errorMessage = document.querySelector(
          `[data-field_error="${field.name}"]`
        );

        if (errorMessage) {
          if (isValid) {
            field.classList.remove("field-error");
            errorMessage.classList.add("hide");
          } else {
            const textBox = errorMessage.querySelector(
              "div"
            ) || errorMessage;

            field.classList.add("field-error");

            textBox.innerHTML = typeof message === "string"
              ? message
              : message(field, fields);

            errorMessage.classList.remove("hide");

            break;
          }
        }
      }
    }
  }

  return validations.every((validation) => validation);
};

const initFormSubmit = (
  identifier,
  {
    url,
    buildBody,
    method = "POST",
    headers = { "Content-Type": "application/json" },
    disableWebflowFormSubmission = false,
    customSuccess = null,
    formDisplay = "block",
    displayApiError = false,
    schema = null
  }
) => {
  const element = document.getElementById(identifier);

  if (element) {
    const requestApi = async (form, manualSubmission) => {
      const { elements: fields, parentNode } = form;

      const loadingMessage = parentNode.querySelector(
        "[data-message='loading']"
      );

      const successMessage = parentNode.querySelector(".w-form-done");
      const errorMessage = parentNode.querySelector(".w-form-fail");

      const setDisplay = (element, display = "block", callback = null) => {
        if (element) {
          if (callback) {
            const textBox = element.querySelector("div") || element;

            callback(textBox);
          }

          if (isForm) {
            element.style.display = display;
          }
        }
      };

      try {
        const body = JSON.stringify(buildBody(fields));

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

        setDisplay(successMessage, "block", (textBox) => {
          if (customSuccess) {
            textBox.innerHTML = typeof customSuccess === "string"
              ? customSuccess
              : customSuccess(data);
          }
        });

        setDisplay(errorMessage, "none");

        if (manualSubmission) {
          form.submit();
        }
      } catch (error) {
        setDisplay(form, formDisplay);
        loadingMessage.classList.add("hide");
        setDisplay(successMessage, "none");

        setDisplay(errorMessage, "block", (textBox) => {
          if (displayApiError) {
            textBox.innerHTML = error.message || "Error occurred";
          }
        });

        throw error;
      }
    };

    if (element.tagName === "FORM") {
      if (disableWebflowFormSubmission) {
        element.action = "/";
      }

      element.addEventListener("submit", function (e) {
        e.preventDefault();
        requestApi(this);
      });
    } else {
      const form = element.closest("form");

      if (disableWebflowFormSubmission) {
        form.action = "/";
      }

      element.addEventListener("click", (e) => {
        e.preventDefault();

        if (schema) {
          const isValid = validateFields(form, schema);

          if (!isValid) {
            return false;
          }
        }

        requestApi(form, true);
      });
    }
  }
};

const lazyLoadAssets = () => {
  const assets = Array.from(document.querySelectorAll('[data-lazy="true"]'));

  if (assets.length > 0) {
    if ("IntersectionObserver" in window) {
      const assetObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (isIntersecting) {
            if (target.tagName === "VIDEO") {
              for (const { dataset: { src } } of target.children) {
                source.src = src;
              }

              target.load();
            }

            if (target.tagName === "DIV") {
              target.style.backgroundImage = `url(${
                target.dataset.src
              })`;
            }

            target.removeAttribute("data-lazy");
            observer.unobserve(target);
          }
        });
      });

      assets.forEach((asset) => {
        assetObserver.observe(asset);
      });
    } else {
      const loadAssets = () => {
        assets.forEach((asset) => {
          const { top, bottom, left, right } = asset.getBoundingClientRect();
          const { innerHeight, innerWidth } = window;

          if (
            top < innerHeight && bottom > 0 && left < innerWidth && right > 0
          ) {
            if (asset.tagName === "VIDEO") {
              for (const { dataset: { src } } of asset.children) {
                source.src = src;
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

const injectSvgs = () => {
  const svgWrappers = document.querySelectorAll("[data-wrapper='svg']");

  if (svgWrappers.length > 0) {
    svgWrappers.forEach((wrapper) => {
      wrapper.parentNode.innerHTML = wrapper.innerText;
    });
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

const initResponsiveGsapAnimations = () => {
  const animationElements = Array.from(document.querySelectorAll(
    "[data-animation][data-breakpoint]"
  ));

  if (animationElements.length > 0) {
    const animationMap = animationElements.reduce((init, element) => {
      const { breakpoint, animation } = element.dataset;

      if (init[breakpoint]) {
        init[breakpoint].push(element);
      } else {
        init[breakpoint] = [element];
      }

      return init;
    }, {});

    Object.entries(animationMap).forEach(([breakpoint, elements]) => {
      const resolvedBreakpoint = parseInt(breakpoint);

      const media = window.matchMedia(`only screen and (${
        resolvedBreakpoint >= 0 ? "min" : "max"
      }-width: ${
        resolvedBreakpoint >= 0 ? resolvedBreakpoint : resolvedBreakpoint * -1
      }px)`);

      const runOnMatch = (media) => {
        if (!media.matches) {
          elements.forEach((element) => {
            element.setAttribute("data-animation", "none");
          });
        }
      };

      runOnMatch(media);

      window.addEventListener("resize", () => {
        runOnMatch(media);
      });

      media.addEventListener("change", runOnMatch);
    });
  }
};

const initMasonry = (identifier, configSet) => {
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

  const handleInitMasonries = () => {
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
            masonries.push(masonry);
          }

          if (!media.matches && masonry) {
            masonry.destroy();
            masonry = null;
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

    return masonries;
  };

  const masonryElement = document.querySelector(identifier);
  const { breakpoint } = masonryElement.dataset;
  let masonries = null;

  if (breakpoint) {
    const resolvedBreakpoint = parseInt(breakpoint);

    const initOnMatch = (media) => {
      if (media.matches && !masonries) {
        masonries = handleInitMasonries();
      }

      if (!media.matches && masonries) {
        masonries.forEach((masonry) => masonry.destroy());
        masonries = null;
      }
    };

    const media = window.matchMedia(
      `only screen and (${resolvedBreakpoint >= 0 ? "min" : "max"}-width: ${
        resolvedBreakpoint >= 0 ? resolvedBreakpoint : resolvedBreakpoint * -1
      }px)`
    );

    initOnMatch(media);

    window.addEventListener("resize", () => {
      initOnMatch(media);
    });

    media.addEventListener("change", initOnMatch);
  } else {
    masonries = handleInitMasonries();
  }
};

const initSlider = (identifier, config) => {
  const sliderElement = document.querySelector(identifier);
  const { parentNode, dataset: { breakpoint } } = sliderElement;

  if (config.pagination) {
    const {
      id,
      firstChild: { className }
    } = parentNode.querySelector(".swiper-pagination");

    config.pagination = { el: id, type: config.pagination };

    if (config.pagination.type === "bullets") {
      config.pagination = {
        bulletClass: className.replace(
          "swiper-pagination-bullet-active",
          ""
        ),
        clickable: true
      };
    }

    if (config.pagination.type === "progressbar") {
      config.pagination = { progressbarFillClass: className };
    }
  }

  if (config.navigation) {
    const { id: prevId } = parentNode.querySelector(".swiper-button-prev");
    const { id: nextId } = parentNode.querySelector(".swiper-button-next");

    config.navigation = { prevEl: prevId, nextEl: nextId };
  }

  if (config.scrollbar) {
    const { id } = parentNode.querySelector(".swiper-scrollbar");

    config.scrollbar = { el: id, draggable: true };
  }

  let slider = null;

  if (breakpoint) {
    const resolvedBreakpoint = parseInt(breakpoint);

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
      `only screen and (${resolvedBreakpoint >= 0 ? "min" : "max"}-width: ${
        resolvedBreakpoint >= 0 ? resolvedBreakpoint : resolvedBreakpoint * -1
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
  const { params, slides, el } = swiper;
  const { direction, slidesPerView, loop, spaceBetween } = params;

  if (direction && direction === "vertical") {
    const activeIndex = swiper[loop ? "realIndex" : "activeIndex"];
    const resolvedSlidesPerView = parseInt(slidesPerView) || 1;
    const currentSlideLimit = activeIndex + resolvedSlidesPerView;
    let height = 0;

    for (let i = activeIndex; i < currentSlideLimit; i++) {
      if (slides[i]) {
        height += slides[i].offsetHeight;
      }
    }

    if (spaceBetween && resolvedSlidesPerView > 1) {
      height += (spaceBetween * resolvedSlidesPerView);
    }

    el.style.height = height > 0 ? `${height}px` : "auto";
  }
};

const initSliderTransformSwitchers = (swiper) => {
  const { el, slides, wrapperEl } = swiper;

  if (!el.classList.contains("init-slider-transform-switchers")) {
    el.classList.add("init-slider-transform-switchers");

    slides.forEach((slide) => {
      const switchers = slide.querySelectorAll("[data-slider_transform]");

      if (switchers.length > 0) {
        switchers.forEach((switcher) => {
          switcher.addEventListener("click", () => {
            const { slider_transform } = switcher.dataset;

            if (slider_transform === "off") {
              slide.classList.add("transform-none");
              wrapperEl.classList.add("transform-none");
            } else {
              slide.classList.remove("transform-none");
              wrapperEl.classList.remove("transform-none");
            }
          });
        });
      }
    });
  }
};

const forceLastSlideActive = (swiper) => {
  swiper.snapGrid = [...swiper.slidesGrid];
};

const toggleSlideOverlays = (swiper) => {
  const overlays = swiper.el.querySelectorAll(".slide-overlay");

  overlays.forEach((overlay) => {
    overlay.classList.toggle("hide");
  });
};

const initAutoplayTabs = () => {
  const setActiveTab = (tabLinks, index) => {
    tabLinks.forEach((tabLink, i) => {
      const tabPaneId = tabLink.href.split("#")[1];
      const tabPane = document.getElementById(tabPaneId);

      if (index === i) {
        tabLink.classList.add("w--current");
        tabLink.setAttribute("aria-selected", "true");
        tabLink.removeAttribute("tabindex");
        tabPane.classList.add("w--tab-active");
      } else {
        tabLink.classList.remove("w--current");
        tabLink.setAttribute("aria-selected", "false");
        tabLink.setAttribute("tabindex", "-1");
        tabPane.classList.remove("w--tab-active");
      }
    });
  };

  const resolveIndex = (index, array) => {
    return index < array.length - 1 ? index + 1 : 0;
  };

  const tabs = document.querySelectorAll("[data-autoplay_tab]");

  tabs.forEach((tab) => {
    const tabLinks = tab.querySelectorAll(".w-tab-link");
    const timeInterval = parseInt(tab.dataset.autoplay_tab) || 2000;
    let currentIndex = 0;

    let tabInterval = setInterval(() => {
      setActiveTab(tabLinks, currentIndex);
      currentIndex = resolveIndex(currentIndex, tabLinks);
    }, timeInterval);

    tabLinks.forEach((tabLink, i) => {
      tabLink.addEventListener("click", (e) => {
        e.preventDefault();
        clearInterval(tabInterval);
        setActiveTab(tabLinks, i);
        currentIndex = resolveIndex(i, tabLinks);

        tabInterval = setInterval(() => {
          setActiveTab(tabLinks, currentIndex);
          currentIndex = resolveIndex(currentIndex, tabLinks);
        }, timeInterval)
      });
    });
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
                  onRenderCallback(renderedItems);
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
