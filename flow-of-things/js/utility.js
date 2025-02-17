const injectStyles = (stylesheets, baseUrl) => {
  stylesheets.forEach((stylesheet) => {
    const link = document.createElement("link");

    link.setAttribute("rel", "stylesheet");

    const stylesheetLink = `${baseUrl ? `${baseUrl}/` : ""}${stylesheet}?v=${
      Math.random().toString().substring(2)
    }`;

    link.setAttribute("href", stylesheetLink);
    document.head.appendChild(link);
  });
};
