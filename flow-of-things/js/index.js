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
