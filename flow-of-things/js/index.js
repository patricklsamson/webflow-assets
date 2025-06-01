injectStylesheets([
  "https://cdn.jsdelivr.net/gh/patricklsamson/webflow-assets@main/global/css/index.min.css",
  "https://cdn.jsdelivr.net/gh/patricklsamson/webflow-assets@main/flow-of-things/css/index.min.css"
]);

runOnDomReady(() => {
  const setScript = (selectors, initial) => {
    const script = document.getElementById("script").querySelector("code");

    script.innerHTML = "";

    if (selectors) {
      selectors.forEach((selector) => {
        if (initial && selector.dataset.checked === "true") {
          selector.checked = true;
        }

        const utilityFunction = document.querySelector(
          `[data-script="${selector.id}"]`
        );

        script.innerHTML += selector.checked
          ? `${utilityFunction.innerText.trim()},`
          : "";
      });
    }

    script.innerHTML = script.innerText.length > 0
      ? `const ${script.innerText.slice(0, -1)};`
      : "None selected";
  };

  const selectors = document.querySelectorAll('[data-input="selector"]');

  if (selectors.length > 0) {
    setScript(selectors, true);

    selectors.forEach((selector) => {
      selector.addEventListener("change", function () {
        setScript(selectors);
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

          setScript(selectors);
        });

        setTimeout(() => {
          this.click();
        }, 2000);
      }

      if (button.dataset.button.includes("all")) {
        button.addEventListener("click", function () {
          selectors.forEach((selector) => {
            selector.checked = this.dataset.button === "check-all";
          });

          setScript(selectors);
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
