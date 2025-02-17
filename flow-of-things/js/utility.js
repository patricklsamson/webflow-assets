const injectStylesheets = (stylesheets) => {
  stylesheets.forEach((stylesheet) => {
    const link = document.createElement("link");

    link.setAttribute("rel", "stylesheet");

    link.setAttribute("href", `${stylesheet}?v=${
      Math.random().toString().substring(2)
    }`);

    document.head.appendChild(link);
  });
};
