const runOnDomReady = (callback) => {
  return document.addEventListener("DOMContentLoaded", callback);
};

const injectStylesheets = (stylesheets) => {
  stylesheets.forEach((stylesheet) => {
    const link = document.createElement("link");

    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", stylesheet);
    document.head.appendChild(link);
  });
};

const resolveSpans = () => {
  const texts = document.querySelectorAll("[data-span_style]");

  texts.forEach((text) => {
    const spanClasses = text.dataset.span_style.split("|");
    let index = 0;

    const resolvedText = text.innerHTML.replace(
      /\|([^\s|]+)\|/g,
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
};

const clickElement = (element) => {
  let isClicked = false;

  element.addEventListener("click", () => {
    isClicked = true;
  }, { once: true });

  element.click();

  if (!isClicked) {
    element.dispatchEvent(new Event("mousedown"));
    element.dispatchEvent(new Event("mouseup"));
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

const removeInvisibleElements = () => {
  const invisibleElements = document.querySelectorAll(".w-content-invisible");

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

    if (!response.ok) {
      throw new Error("No response");
    }

    const contentType = response.headers.get("Content-Type");

    if (response.status !== 204) {
      if (contentType === "application/json") {
        return await response.json();
      }

      if (contentType.includes("text/")) {
        return await response.text();
      }
    }

    return null;
  } catch (error) {
    throw error;
  }
};

const handleFormSubmit = async (form, url, body, method, headers) => {
  const formWrapper = form.parentNode;
  const successMessage = formWrapper.querySelector(".w-form-done");
  const errorMessage = formWrapper.querySelector(".w-form-fail");

  try {
    if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    if (body && headers["Content-Type"] === "application/json") {
      body = JSON.stringify(body);
    }

    const response = await fetch(url, { method, headers, body });

    if (!response.ok) {
      throw new Error("No response");
    }

    form.style.display = "none";

    if (successMessage) {
      successMessage.style.display = "block";
    }

    if (errorMessage) {
      errorMessage.style.display = "none";
    }
  } catch (error) {
    form.style.display = "block";

    if (successMessage) {
      successMessage.style.display = "none";
    }

    if (errorMessage) {
      errorMessage.style.display = "block";
    }
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

    if (!targetElement.classList.contains("transform-remover")) {
      targetElement.classList.add("transform-remover");

      targetElement.addEventListener("click", () => {
        slide.classList.toggle("no-transform");
        swiper.wrapperEl.classList.toggle("no-transform");
      });
    }
  });
};

const runAfterFinsweet = (attributeModules, callback) => {
  window.fsAttributes = window.fsAttributes || [];

  const attributeFlag = attributeModules.reduce((init, attributeModule) => {
    init[attributeModule] = false;

    return init;
  }, {});

  attributeModules.forEach((attributeModule) => {
    window.fsAttributes.push([
      attributeModule,
      () => {
        attributeFlag[attributeModule] = true;

        if (Object.values(attributeFlag).every((flag) => flag)) {
          callback();
        }
      }
    ]);
  });
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
