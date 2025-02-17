const injectStyles = (stylesheets, version = 1) => {
  stylesheets.forEach((stylesheet) => {
    const link = document.createElement("link");

    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", `${stylesheet}?v=${version}`);
    document.head.appendChild(link);
  });
};
