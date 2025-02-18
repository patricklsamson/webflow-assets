const injectStylesheets = (stylesheets) => {
  stylesheets.forEach((stylesheet) => {
    const link = document.createElement("link");

    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", stylesheet);
    document.head.appendChild(link);
  });
};
