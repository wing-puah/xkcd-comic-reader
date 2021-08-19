const utils = (function () {
  function getUrlQuery() {
    const queryString = window.location.search;
    return Object.fromEntries(new URLSearchParams(queryString));
  }

  function updateURLParams(urlObject) {
    const urlParams = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(urlObject)) {
      urlParams.set(k, v);
    }

    const { protocol, host, pathname } = window.location;
    const newurl =
      protocol + '//' + host + pathname + '?' + urlParams.toString();
    // prevent reloading
    window.history.pushState({ path: newurl }, '', newurl);
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }

  return { getUrlQuery, updateURLParams, getRandomInt };
})();
