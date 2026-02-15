const injectSourceCodes = (sourceCodes) => {
  if (sourceCodes.length > 0) {
    sourceCodes.forEach((sourceCode) => {
      const { type, url, location } = sourceCode;
      const domTarget = document[location ? location : "head"];

      if (domTarget) {
        if (type === "script") {
          const script = document.createElement("script");

          script.setAttribute("src", url);
          domTarget.appendChild(script);
        } else {
          const link = document.createElement("link");

          link.setAttribute("rel", "stylesheet");
          link.setAttribute("href", url);
          domTarget.appendChild(link);
        }
      }
    });
  }
};

const initStructuredData = () => {
  const { data_type } = document.body.dataset;

  if (data_type) {
    const script = document.createElement("script");

    script.type = "application/ld+json";

    const structuredData = {
      "@context": "https://schema.org",
      "@type": data_type
    };

    switch (data_type) {
      case "WebSite":
        structuredData.name = "Patrick Samson";
        structuredData.url = window.location.href.slice(0, -1);

        break;
      case "WebPage":
        structuredData.name = document.title;
        structuredData.url = window.location.href;

        break;
      case "Article":
      case "BlogPosting":
      case "NewsArticle":
        structuredData.headline = document.querySelector(
          "[data-article='headline']"
        ).innerText;

        const date = new Date(
          document.querySelector("[data-article='date']").innerText
        );

        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const resolvedDate = `${year}-${
          month >= 10 ? month : `0${month}`
        }-${day >= 10 ? day : `0${day}`}`

        structuredData.datePublished = resolvedDate;

        structuredData.author = {
          "@type": "Person",
          name: document.querySelector("[data-article='author']").innerText
        };

        break;
    }

    script.innerHTML = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }
};

const initDarkMode = (onMatch, onUnmatch) => {
  const runOnDarkMode = (media) => {
    if (media.matches) {
      onMatch && onMatch();
    } else {
      onUnmatch && onUnmatch();
    }
  };

  const darkModeMedia = window.matchMedia("(prefers-color-scheme: dark)");

  runOnDarkMode(darkModeMedia);
  darkModeMedia.addEventListener("change", runOnDarkMode);
};

const initAria = () => {
  const ariaElements = document.querySelectorAll("[data-aria]");

  if (ariaElements.length > 0) {
    ariaElements.forEach((element) => {
      const { aria } = element.dataset;

      if (aria === "expansion") {
        element.addEventListener("click", function (e) {
          e.preventDefault();

          const expansion = this.getAttribute("aria-expanded") === "true"
            ? "false"
            : "true";

          this.setAttribute("aria-expanded", expansion);
        });
      }
    });
  }
};

const initMatchHeight = () => {
  const elements = Array.from(document.querySelectorAll("[data-match_height]"));

  if (elements.length > 0) {
    const setHeight = (elementSets, isReset) => {
      for (const matchElements of elementSets) {
        let maxHeight = 0;

        matchElements.forEach((element) => {
          element.style.height = "auto";
        });

        if (!isReset) {
          matchElements.forEach((element) => {
            const { offsetHeight } = element;

            if (offsetHeight > maxHeight) {
              maxHeight = offsetHeight;
            }
          });

          matchElements.forEach((element) => {
            element.style.height = `${maxHeight}px`;
          });
        }
      }
    };

    const nonBreakpointMap = elements.filter((element) => (
      !element.dataset.breakpoint
    )).reduce((init, element) => {
      const { match_height } = element.dataset;

      if (init[match_height]) {
        init[match_height].push(element);
      } else {
        init[match_height] = [element];
      }

      return init;
    }, {});


    if (Object.keys(nonBreakpointMap).length > 0) {
      const nonBreakpointElementSets = Object.values(nonBreakpointMap);

      setHeight(nonBreakpointElementSets);

      window.addEventListener("resize", () => {
        setNormalHeight(nonBreakpointElementSets);
      });

      window.addEventListener("orientationchange", () => {
        setNormalHeight(nonBreakpointElementSets);
      });
    }

    const breakpointMap = elements.filter((element) => (
      element.dataset.breakpoint
    )).reduce((init, element) => {
      const { breakpoint, match_height } = element.dataset;

      if (init[breakpoint] && init[breakpoint][match_height]) {
        init[breakpoint][match_height].push(element);
      } else {
        init[breakpoint] = { [match_height]: [element] };
      }

      return init;
    }, {});

    if (Object.keys(breakpointMap).length > 0) {
      Object.entries(breakpointMap).forEach(([breakpoint, elementMap]) => {
        const resolvedBreakpoint = parseInt(breakpoint);

        const media = window.matchMedia(`only screen and (${
          resolvedBreakpoint >= 0 ? "min" : "max"
        }-width: ${
          resolvedBreakpoint >= 0 ? resolvedBreakpoint : resolvedBreakpoint * -1
        }px)`);

        const runOnMatch = (media) => {
          setHeight(Object.values(elementMap), !media.matches);
        };

        runOnMatch(media);

        window.addEventListener("resize", () => {
          runOnMatch(media);
        });

        media.addEventListener("change", runOnMatch);
      });
    }
  }
};

const initFilters = () => {
  const filterMap = {};

  const setDisplay = () => {
    const filterTargets = Array.from(
      document.querySelectorAll("[data-filter_target]")
    );

    for (const target of filterTargets) {
      const resolvedFilterMapEntries = Object.entries(filterMap).filter(
        ([_, values]) => (values.length > 0)
      );

      const isMatch = resolvedFilterMapEntries.every(([source, values]) => {
        const matchedFilterTargets = Array.from(
          document.querySelectorAll(`[data-filter_target="${source}"]`)
        );

        return matchedFilterTargets.length > 0 &&
          matchedFilterTargets.some((target) => (
            values.includes(target.dataset.filter_target_value)
          ));
      });

      if (resolvedFilterMapEntries.length > 0 && !isMatch) {
        target.classList.add("hide");
      } else {
        target.classList.remove("hide");
      }
    }
  };

  const filterSources = document.querySelectorAll("[data-filter_source]");

  filterSources.forEach((source) => {
    if (source.tagName === "INPUT") {
      if (source.type === "radio" || source.type === "checkbox") {
        source.addEventListener("change", function () {
          const { filter_source, filter_source_value } = this.dataset;

          if (this.checked) {
            filterMap[filter_source] = filterMap[filter_source]
              ? [...filterMap[filter_source], filter_source_value]
              : [filter_source_value]
          } else {
            filterMap[filter_source] = filterMap[filter_source].filter(
              (value) => (value !== filter_source_value)
            );
          }

          setDisplay();
        });
      }

      if (source.type === "text") {
        source.addEventListener("keyup", function () {
          const { value, dataset: { filter_source } } = this;

          filterMap[filter_source] = [value];
          setDisplay();
        });
      }
    }

    if (source.tagName === "SELECT") {
      source.addEventListener("change", function () {
        const { value, dataset: { filter_source } } = this;

        filterMap[filter_source] = [value];
        setDisplay();
      });
    }
  });
};

const initInputDropdowns = () => {
  const inputDropdowns = document.querySelectorAll("[data-dropdown='input']");

  if (inputDropdowns.length > 0) {
    inputDropdowns.forEach((dropdown) => {
      const { dropdown_close_delay, dropdown_multiple } = dropdown.dataset;
      const search = dropdown.querySelector("[data-dropdown='search']");
      const options = dropdown.querySelectorAll("[data-dropdown='option']");

      const valueTarget = dropdown.querySelector(
        "[data-dropdown='value-target']"
      );

      if (search) {
        const fixSpacePropagation = (e) => {
          if (e.code === "Space") {
            e.stopPropagation();
          }
        };

        search.addEventListener("keydown", fixSpacePropagation);
        search.addEventListener("keypress", fixSpacePropagation);
        search.addEventListener("input", fixSpacePropagation);

        search.addEventListener("keyup", function (e) {
          fixSpacePropagation(e);

          const searchValue = this.value.toLowerCase();

          options.forEach((option) => {
            const valueSource = option.querySelector(
              "[data-dropdown='value-source']"
            );

            const value = valueSource
              ? valueSource.innerHTML.toLowerCase()
              : option.innerText.toLowerCase();

            if (value.includes(searchValue)) {
              option.classList.remove("hide");
            } else {
              option.classList.add("hide");
            }
          });

          const empty = dropdown.querySelector("[data-dropdown='empty']");

          if (empty) {
            const hiddenOptions = dropdown.querySelectorAll(
              ".hide[data-dropdown='option']"
            );

            if (options.length === hiddenOptions.length) {
              empty.classList.remove("hide");
            } else {
              empty.classList.add("hide");
            }
          }
        });
      }

      const closeDropdown = () => {
        const toggle = dropdown.querySelector(".w-dropdown-toggle");
        const list = dropdown.querySelector(".w-dropdown-list");

        toggle.dispatchEvent(new Event("mousedown"));
        toggle.dispatchEvent(new Event("mouseup"));
        toggle.click();

        setTimeout(() => {
          toggle.classList.remove("w--open");
          toggle.setAttribute("aria-expanded", "false");
          list.classList.remove("w--open");
        }, parseInt(dropdown_close_delay) || 250);
      };

      options.forEach((option) => {
        const input = option.querySelector("input");

        if (input) {
          const defaultValue = valueTarget.innerHTML;

          const valueSource = option.querySelector(
            "[data-dropdown='value-source']"
          );

          const value = valueSource
            ? valueSource.innerHTML
            : option.innerText;

          input.addEventListener("change", function () {
            if (dropdown_multiple && valueTarget) {
              if (this.checked) {
                valueTarget.innerHTML = valueTarget.innerHTML === defaultValue
                  ? value
                  : `${valueTarget.innerHTML}, ${value}`;
              } else {
                const currentValues = valueTarget.innerHTML.split(", ");

                const newValue = currentValues.filter(
                  (currentValue) => (currentValue !== value)
                ).join(", ")

                valueTarget.innerHTML = newValue === ""
                  ? defaultValue
                  : newValue;
              }
            }

            if (!dropdown_multiple) {
              if (valueTarget) {
                valueTarget.innerHTML = value;
              }

              closeDropdown();
            }
          });
        } else {
          option.addEventListener("click", function () {
            if (valueTarget) {
              const valueSource = this.querySelector(
                "[data-dropdown='value-source']"
              );

              const value = valueSource
                ? valueSource.innerHTML
                : option.innerText;

              valueTarget.value = value;
            }

            closeDropdown();
          });
        }
      });
    });
  }
};

const initInputTriggers = () => {
  const triggers = document.querySelectorAll("[data-input_trigger]");

  triggers.forEach((trigger) => {
    trigger.addEventListener("change", function () {
      const { type, checked, dataset, dataset: { input_trigger } } = this;

      const target = document.querySelector(
        `[data-input_target="${input_trigger}"]`
      );

      const triggerValue = Object.keys(dataset).find((key) => (
        key.includes("input_trigger_value")
      ));

      if (target && triggerValue) {
        if (type === "radio") {
          target.value = checked ? dataset[triggerValue] : "";
        }

        if (type === "checkbox") {
          if (checked) {
            target.value = target.value === ""
              ? dataset[sourceValue]
              : `${target.value}, ${dataset[triggerValue]}`;
          } else {
            target.value = target.value === ""
              ? ""
              : target.value.split(", ").filter(
                (value) => (value !== dataset[triggerValue])
              ).join(", ");
          }
        }
      }
    });
  });
};

const requestApi = async (
  url,
  {
    loaderIdentifier,
    callback,
    body,
    method = "GET",
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

const initFormSubmit = (
  identifier,
  {
    url,
    buildBody,
    loaderIdentifier,
    customSuccess,
    displayApiError,
    schema,
    method = "POST",
    headers = { "Content-Type": "application/json" },
    formDisplay = "block"
  }
) => {
  const form = document.getElementById(identifier);

  if (form) {
    const mainSubmitButton = form.querySelector("[type='submit']");
    const submitButton = form.querySelector("[data-form_button='submit']");

    submitButton.addEventListener("click", async function (e) {
      e.preventDefault();

      if (schema) {
        const { elements: fields, parentNode } = form;
        const validations = [];

        for (const field of fields) {
          const fieldRules = schema[field.name];

          if (fieldRules) {
            const fields = Array.from(
              document.querySelectorAll(`[name="${field.name}"]`)
            );

            for (const { validate, message } of fieldRules) {
              const isValid = validate(field, fields);

              validations.push(isValid);

              const errorMessage = document.querySelector(
                `[data-form_field_error="${field.name}"]`
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

        if (validations.some((validation) => !validation)) {
          return false;
        }
      }

      if (url) {
        const { elements: fields, parentNode } = form;

        const loadingMessage = loaderIdentifier
          ? document.getElementById(loaderIdentifier)
          : parentNode.querySelector("[data-form_message='loading']");

        const successMessage = parentNode.querySelector(".w-form-done");
        const errorMessage = parentNode.querySelector(".w-form-fail");
        const errorText = "Oops! Something went wrong while submitting the form.";

        const setDisplay = (element, display = "block", callback = null) => {
          if (element) {
            if (callback) {
              const textBox = element.querySelector("div") || element;

              callback(textBox);
            }

            element.style.display = display;
          }
        };

        try {
          loadingMessage.classList.remove("hide");

          const body = JSON.stringify(buildBody(fields));

          const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json", ...headers },
            body
          });

          if (!response.ok) {
            if (response.headers.get("Content-Type") === "application/json") {
              const data = await response.json();

              throw new Error(data.message || errorText);
            }

            throw new Error(errorText);
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
          mainSubmitButton.click();
        } catch (error) {
          setDisplay(form, formDisplay);
          loadingMessage.classList.add("hide");
          setDisplay(successMessage, "none");

          setDisplay(errorMessage, "block", (textBox) => {
            if (displayApiError) {
              textBox.innerHTML = error.message || errorText;
            }
          });

          throw error;
        }
      } else {
        mainSubmitButton.click();
      }
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

const initMasonry = (identifier, configSet) => {
  const resolveConfig = (config, configIndex) => {
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

    if (configIndex) {
      const previousConfig = Object.values(configSet).reduce(
        (init, item, i) => {
          return i <= configIndex ? {  ...init, ...item } : init;
        },
        {}
      );

      return { ...previousConfig, ...config };
    }

    return config;
  };

  const handleInitMasonries = () => {
    const masonries = [];

    if (configSet.baseWidth) {
      const resolvedConfig = resolveConfig(configSet);
      const masonry = new MiniMasonry(resolvedConfig);

      masonries.push(masonry);
    } else {
      const breakpoints = Object.keys(configSet);

      for (const [index, breakpoint] of breakpoints.entries()) {
        let masonry = null;

        const runOnMatch = (media) => {
          if (media.matches && !masonry) {
            const resolvedConfig = resolveConfig(configSet[breakpoint], index);

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

  const { dataset: { breakpoint } } = document.querySelector(identifier);
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

const getVisibility = (element) => {
  const { top, bottom, left, right } = element.getBoundingClientRect();
  const { innerWidth, innerHeight } = window;

  if (top >= innerHeight || bottom <= 0 || left >= innerWidth || right <= 0) {
    return "invisible";
  }

  if (top < innerHeight && bottom > 0 && left < innerWidth && right > 0) {
    return "partial";
  }

  if (top >= 0 && bottom <= innerHeight && left >= 0 && right <= innerWidth) {
    return "full";
  }

  return null;
};

const lazyLoadAssets = () => {
  const loadAssets = () => {
    const assets = document.querySelectorAll('[data-loading="lazy"]');

    if (assets.length > 0) {
      assets.forEach((asset) => {
        const { top, bottom, left, right } = asset.getBoundingClientRect();
        const { innerHeight, innerWidth } = window;

        if (
          top < innerHeight && bottom > 0 && left < innerWidth && right > 0
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

          asset.removeAttribute("data-loading");
        }
      });
    } else {
      window.removeEventListener("scroll", loadAssets);
      window.removeEventListener("resize", loadAssets);
      window.removeEventListener("orientationchange", loadAssets);
    }
  };

  const assets = document.querySelectorAll('[data-loading="lazy"]');

  if (assets.length > 0) {
    loadAssets();
    window.addEventListener("scroll", loadAssets);
    window.addEventListener("resize", loadAssets);
    window.addEventListener("orientationchange", loadAssets);
  }
};

const injectSvgs = () => {
  const svgTargets = document.querySelectorAll("[data-svg='target']");

  if (svgTargets.length > 0) {
    svgTargets.forEach((wrapper) => {
      wrapper.parentNode.innerHTML = wrapper.innerText;
    });
  }
};

const initResponsiveGsapInteractions = () => {
  const interactionElements = Array.from(
    document.body.querySelectorAll("*")
  ).filter((element) => (
    Object.keys(element.dataset).some((key) => (
      key.includes("interaction_")
    )) && element.dataset.breakpoint
  ));

  if (interactionElements.length > 0) {
    const interactionMap = interactionElements.reduce((init, element) => {
      const { breakpoint } = element.dataset;

      if (init[breakpoint]) {
        init[breakpoint].push(element);
      } else {
        init[breakpoint] = [element];
      }

      return init;
    }, {});

    Object.entries(interactionMap).forEach(([breakpoint, elements]) => {
      const resolvedBreakpoint = parseInt(breakpoint);

      const media = window.matchMedia(`only screen and (${
        resolvedBreakpoint >= 0 ? "min" : "max"
      }-width: ${
        resolvedBreakpoint >= 0 ? resolvedBreakpoint : resolvedBreakpoint * -1
      }px)`);

      const runOnMatch = (media) => {
        if (!media.matches) {
          elements.forEach((element) => {
            const attribute = Object.keys(element.dataset).find((key) => (
              key.includes("interaction_")
            ));

            element.setAttribute(attribute, "none");
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

const initLenis = (config) => {
  const lenis = new Lenis(config);

  if (gsap && ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  return lenis;
};

const initScrollAnchors = () => {
  const triggers = Array.from(
    document.querySelectorAll("[data-scroll_href]")
  ).filter((trigger) => trigger.dataset.scroll_href);

  if (triggers.length > 0) {
    const setScrollTriggers = (triggers, scrollBottom) => {
      triggers.forEach((trigger) => {
        trigger.addEventListener("click", function (e) {
          e.preventDefault();

          const { scroll_href, scroll_delay, scroll_duration } = this.dataset;

          const target = document.querySelector(
            `[data-scroll_id="${scroll_href}"]`
          );

          if (target) {
            const { top } = target.getBoundingClientRect();

            setTimeout(() => {
              if (typeof lenis === undefined) {
                window.scrollTo({
                  top: (top + window.scrollY) - (
                    scrollBottom ? window.innerHeight : 0
                  ),
                  behavior: "smooth",
                });
              } else {
                lenis.scrollTo((top + lenis.scroll) - (
                  scrollBottom ? window.innerHeight : 0
                ), {
                  duration: parseInt(scroll_duration) || 1.2
                });
              }
            }, parseInt(scroll_delay) || 0);
          } else {
            setTimeout(() => {
              if (typeof lenis === undefined) {
                window.scrollTo({
                  top: (
                    scroll_href === "top"
                      ? 0
                      : document.documentElement.scrollHeight
                  ),
                  behavior: "smooth",
                });
              } else {
                lenis.scrollTo((
                  scroll_href === "top" ? 0 : lenis.limit
                ), {
                  duration: parseInt(scroll_duration) || 1.2
                });
              }
            }, parseInt(scroll_delay) || 0);
          }
        });
      });
    };

    const nonBreakpointTriggers = triggers.filter((trigger) => (
      !trigger.dataset.breakpoint
    ));

    if (nonBreakpointTriggers.length > 0) {
      setScrollTriggers(nonBreakpointTriggers);
    }

    const breakpointMap = triggers.reduce((init, trigger) => {
      const { scroll_bottom_breakpoint } = trigger.dataset;

      if (init[scroll_bottom_breakpoint]) {
        init[scroll_bottom_breakpoint].push(trigger);
      } else {
        init[scroll_bottom_breakpoint] = [trigger];
      }

      return init;
    }, {});

    if (Object.keys(breakpointMap).length > 0) {
      Object.entries(breakpointMap).forEach(([breakpoint, triggers]) => {
        const resolvedBreakpoint = parseInt(breakpoint);

        const media = window.matchMedia(`only screen and (${
          resolvedBreakpoint >= 0 ? "min" : "max"
        }-width: ${
          resolvedBreakpoint >= 0 ? resolvedBreakpoint : resolvedBreakpoint * -1
        }px)`);

        const runOnMatch = (media) => {
          setScrollTriggers(triggers, media.matches);
        };

        runOnMatch(media);

        window.addEventListener("resize", () => {
          runOnMatch(media);
        });

        media.addEventListener("change", runOnMatch);
      });
    }
  }
};

const initSlider = (identifier, config, effectConfigSet) => {
  const sliderElement = document.querySelector(identifier);
  const { parentNode, dataset: { breakpoint } } = sliderElement;

  if (sliderElement.classList.contains("w-dyn-list")) {
    const sliderWrapper = sliderElement.querySelector(".swiper-wrapper");

    sliderWrapper.removeAttribute("role");
  }

  if (config.pagination) {
    const pagination = parentNode.querySelector(".swiper-pagination");

    if (pagination) {
      const { id } = pagination;

      const type = typeof config.pagination === "string"
        ? config.pagination
        : config.pagination.type;

      const paginationConfig = { el: `#${id}`, type };

      if (type === "bullets") {
        const bullet = parentNode.querySelector(
          ".swiper-pagination-bullet"
        );

        if (bullet) {
          const { className } = bullet;

          paginationConfig.bulletClass = className.replace(
            "swiper-pagination-bullet-active",
            ""
          );

          paginationConfig.clickable = true;
        }
      }

      if (type === "progressbar") {
        const progressBar = parentNode.querySelector(
          ".swiper-pagination-progressbar-fill"
        );

        if (progressBar) {
          const { className } = progressBar;

          paginationConfig.progressbarFillClass = className;
        }
      }

      config.pagination = Object.prototype.toString.call(
        config.pagination
      ) === "[object Object]"
        ? { ...config.pagination, ...paginationConfig }
        : paginationConfig;
    }
  }

  if (config.navigation) {
    const previousButton = parentNode.querySelector(".swiper-button-prev");
    const nextButton = parentNode.querySelector(".swiper-button-next");

    if (previousButton && nextButton) {
      const { id: prevId } = previousButton;
      const { id: nextId } = nextButton;

      const navigationConfig = {
        prevEl: `#${prevId}`,
        nextEl: `#${nextId}`,
        addIcons: false
      };

      config.navigation = Object.prototype.toString.call(
        config.navigation
      ) === "[object Object]"
        ? { ...config.navigation, ...navigationConfig }
        : navigationConfig;
    }
  }

  if (config.scrollbar) {
    const scrollbar = parentNode.querySelector(".swiper-scrollbar");

    if (scrollbar) {
      const { id } = scrollbar;
      const scrollbarConfig = { el: `#${id}`, draggable: true };

      config.scrollbar = Object.prototype.toString.call(
        config.scrollbar
      ) === "[object Object]"
        ? { ...config.scrollbar, ...scrollbarConfig }
        : scrollbarConfig;
    }
  }

  const handleInitSliders = () => {
    const sliders = [];

    if (effectConfigSet) {
      const breakpoints = Object.entries(effectConfigSet);

      for (const [breakpoint, effectConfig] of breakpoints) {
        let slider = null;

        const runOnMatch = (media) => {
          config.init = false;

          const resolvedConfig = media.matches
            ? { ...config, ...effectConfig }
            : config;

          if (slider) {
            slider.destroy();
            slider = null;
          }

          slider = new Swiper(identifier, resolvedConfig);
          slider.init();
          sliders.push(slider);
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
    } else {
      const slider = new Swiper(identifier, config);

      sliders.push(slider);
    }

    return sliders;
  };

  let sliders = null;

  if (breakpoint) {
    const resolvedBreakpoint = parseInt(breakpoint);

    const initOnMatch = (media) => {
      if (media.matches && !sliders) {
        sliders = handleInitSliders();
      }

      if (!media.matches && sliders) {
        sliders.forEach((slider) => slider.destroy());
        sliders = null;
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
    sliders = handleInitSliders();
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
  const overlays = swiper.el.querySelectorAll("[data-slide='overlay']");

  overlays.forEach((overlay) => {
    overlay.classList.toggle("hide");
  });
};

const resolveSpans = () => {
  const texts = document.querySelectorAll("[data-span_style]");

  if (texts.length > 0) {
    texts.forEach((text) => {
      const { span_style } = text.dataset;

      if (span_style.length > 0) {
        const spanClasses = span_style.split("|");
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
      }
    });
  }
};

const openActiveAccordions = () => {
  const accordionHeaders = document.querySelectorAll(
    "[data-accordion='active']"
  );

  if (accordionHeaders.length > 0) {
    accordionHeaders.forEach((header) => {
      header.dispatchEvent(new Event("mousedown"));
      header.dispatchEvent(new Event("mouseup"));
      header.click();
    });
  }
};

const initForceOpenDropdowns = () => {
  const dropdowns = document.querySelectorAll("[data-force_class]");

  if (dropdowns.length > 0) {
    dropdowns.forEach((dropdown) => {
      const { force_class } = dropdown.dataset;
      const triggers = dropdown.querySelectorAll("[data-force_trigger]");

      triggers.forEach((trigger) => {
        trigger.addEventListener("click", function (e) {
          e.preventDefault();

          if (this.dataset.force_trigger === "open") {
            dropdown.classList.add(force_class);
          } else {
            dropdown.classList.remove(force_class);
          }
        });
      });
    });
  }
};

const initMirrorClick = () => {
  const triggers = document.querySelectorAll("[data-mirror_trigger]");

  if (triggers.length > 0) {
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", function (e) {
        e.preventDefault();

        const { mirror_trigger, mirror_delay } = this.dataset;

        const targets = document.querySelectorAll(
          `[data-mirror_target="${mirror_trigger}"]`
        );

        if (targets.length > 0) {
          setTimeout(() => {
            targets.forEach((target) => {
              if (
                target.classList.contains("w-dropdown-toggle") &&
                target.classList.contains("w--open")
              ) {
                return false;
              }

              target.dispatchEvent(new Event("mousedown"));
              target.dispatchEvent(new Event("mouseup"));
              target.click();
            });
          }, parseInt(mirror_delay) || 0);
        }
      });
    });
  }
};

const initCookie = (
  modalIdentifier,
  acceptIdentifier,
  denyIdentifier,
  expiry = 0
) => {
  if (document.cookie.includes("cookie_consent_accepted")) {
    const modal = document.getElementById(modalIdentifier);

    if (modal) {
      modal.classList.add("hide");
    }
  } else {
    const cookieButtons = document.querySelectorAll(
      `#${acceptIdentifier}, #${denyIdentifier}`
    );

    if (cookieButtons.length > 0) {
      cookieButtons.forEach((button) => {
        button.addEventListener("click", function () {
          let cookie = `cookie_consent_accepted=${
            this.id === acceptIdentifier
          };`;

          if (expiry > 0) {
            const date = new Date();

            date.setDate(date.getDate() + expiry);
            cookie += ` expires=${date.toUTCString()}`;
          }

          document.cookie = cookie;
        });
      });
    }
  }
};

const initProgressBars = () => {
  const setValue = async (progressBar, targetValue) => {
    const sleep = (waitTime) => new Promise(
      (resolve) => setTimeout(resolve, parseInt(waitTime) || 250)
    );

    const { progress_transition } = progressBar.dataset;

    const progressFill = progressBar.querySelector(
      "[data-progress_target='fill']"
    );

    const progressValue = progressBar.querySelector(
      "[data-progress_target='value']"
    );

    let resolvedTargetValue = parseInt(targetValue);
    let resolvedCurrentValue = parseInt(progressValue.innerHTML);

    progressFill.style.width = `${resolvedTargetValue}%`;

    if (resolvedTargetValue > resolvedCurrentValue) {
      while (resolvedTargetValue > resolvedCurrentValue) {
        await sleep(progress_transition);
        resolvedCurrentValue++;
        progressValue.innerHTML = resolvedCurrentValue;
        progressValue.setAttribute("aria-valuenow", resolvedCurrentValue);
      }
    } else {
      while (resolvedTargetValue < resolvedCurrentValue) {
        await sleep(progress_transition);
        resolvedCurrentValue--;
        progressValue.innerHTML = resolvedCurrentValue;
        progressValue.setAttribute("aria-valuenow", resolvedCurrentValue);
      }
    }
  };

  const triggerSources = document.querySelectorAll(
    "[data-progress_type='trigger'][data-progress_trigger_source]"
  );

  if (triggerSources.length > 0) {
    triggerSources.forEach((source) => {
      source.addEventListener("click", function () {
        const { progress_trigger_source, progress_valuemax } = this.dataset;

        const progressBar = document.querySelector(
          `[data-progress_trigger_target='${progress_trigger_source}']`
        );

        setValue(progressBar, progress_valuemax);
      });
    });
  }

  const loadSources = document.querySelectorAll("[data-progress_type='load']");

  if (loadSources.length > 0) {
    const loadProgressBars = () => {
      const sources = document.querySelectorAll("[data-progress_type='load']");

      if (sources.length > 0) {
        sources.forEach((source) => {
          const { top, bottom, left, right } = source.getBoundingClientRect();
          const { innerWidth, innerHeight } = window;

          if (
            top < innerHeight && bottom > 0 && left < innerWidth && right > 0
          ) {
            const targetValue = source.getAttribute("aria-valuemax");

            setValue(source, targetValue);
            source.removeAttribute("data-progress_type");
          } else {
            window.removeEventListener("scroll", loadProgressBars);
            window.removeEventListener("resize", loadProgressBars);
            window.removeEventListener("orientationchange", loadProgressBars);
          }
        });
      }
    };

    loadProgressBars();
    window.addEventListener("scroll", loadProgressBars);
    window.addEventListener("resize", loadProgressBars);
    window.addEventListener("orientationchange", loadProgressBars);
  }
};

const initToc = () => {
  const tocSources = document.querySelectorAll("[data-toc_source]");

  if (tocSources.length > 0) {
    tocSources.forEach((tocSource) => {
      const tocTarget = document.querySelector(
        `[data-toc_target="${tocSource.dataset.toc_source}"]`
      );

      const tocClone = tocTarget.firstElementChild.cloneNode(true);
      let nextLevel = tocClone;
      let depth = 1;

      while (nextLevel.lastElementChild.querySelector("[data-toc='label']")) {
        nextLevel = nextLevel.lastElementChild;
        depth++;
      }

      tocTarget.innerHTML = "";

      const headings = tocSource.querySelectorAll("h2, h3, h4, h5, h6");

      headings.forEach((heading, i) => {
        const level = parseInt(heading.tagName.replace("H", ""));

        if (level <= depth) {
          const headingSlug = `${
            heading.textContent.toLowerCase().split(" ").join("-")
          }-${i}`;

          const offsets = document.querySelectorAll("[data-toc='offset']");
          let anchorOffset = parseInt(tocTarget.dataset.toc_offset) || 16;

          if (offsets.length > 0) {
            offsets.forEach((offset) => {
              anchorOffset += offset.offsetHeight;
            });
          }

          const headingAnchor = document.createElement("div");

          headingAnchor.style.position = "relative";

          headingAnchor.innerHTML = `<div id="${
            headingSlug
          }" style="position: absolute; margin-top: -${
            anchorOffset
          }px;"></div>`;

          tocSource.insertBefore(headingAnchor, heading);

          let levelTarget = tocClone;

          for (let l = 2; l < level; l++) {
            if (levelTarget.querySelector("[data-toc='label']")) {
              levelTarget = levelTarget.lastElementChild;
            }
          }

          const levelTargetClone = levelTarget.cloneNode(true);

          if (
            level < depth &&
            levelTargetClone.lastElementChild.querySelector(
              "[data-toc='label']"
            )
          ) {
            levelTargetClone.lastElementChild.remove();
          }

          const label = levelTargetClone.querySelector(
            "[data-toc='label']"
          );

          if (label) {
            label.innerHTML = heading.innerHTML;
          }

          const link = levelTargetClone.querySelector("a");

          if (link) {
            link.href = `#${headingSlug}`;
          }

          let parentTarget = tocTarget;

          for (let l = 2; l < level - 1; l++) {
            if (parentTarget.querySelector("[data-toc='label']")) {
              parentTarget = parentTarget.lastElementChild;
            }
          }

          parentTarget.appendChild(levelTargetClone);
        }
      });
    });
  }
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
    const timeInterval = parseInt(tab.dataset.autoplay_tab) || 1000;
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

const initZoomer = (identifier, config) => {
  const zoomerContainer = document.querySelector(identifier);

  if (!zoomerContainer.classList.contains("zoomer-initialized")) {
    new Zoomist(identifier, config);
    zoomerContainer.classList.add("zoomer-initialized");
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
          socialMediaUrl = share_url;
      }

      if (share_url === "clipboard") {
        sharer.addEventListener("click", function (e) {
          e.preventDefault();

          const { slug } = this.dataset;
          const { origin, href } = window.location;

          navigator.clipboard.writeText(`${slug ? `${origin}${slug}` : href}`);
        });
      } else {
        sharer.href = `${slug ? `${socialMediaUrl}${origin}${slug}` : href}`;
        sharer.target = "_blank";
        sharer.rel = "noopener noreferrer";
      }
    });
  }
};

const initInterval = (callback, timeInterval = 250) => {
  const interval = setInterval(() => {
    callback(() => clearInterval(interval));
  }, timeInterval);
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

const resetWebflow = (version = "ix2") => {
  const webflow = window.Webflow;

  if (webflow) {
    webflow.destroy();
    webflow.ready();
    webflow.require(version).init();
    document.dispatchEvent(new Event("readystatechange"));
  }
};

const resetWebflowAfterWized = (onEndRequests, onceRequests) => {
  const resetWebflow = (version = "ix2") => {
    const webflow = window.Webflow;

    if (webflow) {
      webflow.destroy();
      webflow.ready();
      webflow.require(version).init();
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
