const defaultSettings = {
  perPage: 3,
  start: 1,
};

(function comicReader() {
  // initial fetching
  initFetchComic();

  const prevButton = document.getElementById('prev');
  const nextButton = document.getElementById('next');
  const randomButton = document.getElementById('random');
  const selectorDropdown = document.getElementById('count');

  prevButton.addEventListener('click', function () {
    initFetchComic('prev');
  });

  nextButton.addEventListener('click', function () {
    initFetchComic('next');
  });

  randomButton.addEventListener('click', function () {
    initFetchComic('random');
  });

  selectorDropdown.addEventListener('change', function () {
    console.log('drop down change');
    //   initFetchComic('select')
  });

  async function initFetchComic(key) {
    const query = createFetchParams(key);
    utils.updateURLParams(query);
    pageController.showLoadingIndicator();

    try {
      const comic = await fetchAndPopulateComic(query);

      if (!comic) {
        handleEmptyComic();
      }
      // if no comic => displayZeroComicError
      populateComic(comic, query.perPage);
      pageController.hideLoadingIndicator();
    } catch (error) {
      console.error(`Error encounter: ${error}`);
      disabledComicButtons();
      pageController.showError(error);
      pageController.hideLoadingIndicator();
    }
  }

  function createFetchParams(key) {
    const query = utils.getUrlQuery();
    const start = Number(query.start);
    const perPage = Number(query.perPage);

    switch (key) {
      case 'next':
        return { start: start + perPage, perPage: query.perPage };

      case 'prev':
        return { start: start - perPage, perPage: query.perPage };

      case 'random':
        const sign = Math.random() > 0.5 ? 'add' : 'minus';
        const randomInt = getRandomInt(1, 20);
        if (sign === 'add') {
          return { start: start + randomInt, perPage: query.perPage };
        } else {
          const newPage = start - randomInt;
          const finalPage = newPage > 0 ? newPage : start + randomInt;
          return { start: finalPage, perPage: query.perPage };
        }

      default:
        return {
          start: defaultSettings.start,
          perPage: defaultSettings.perPage,
        };
    }
  }

  function fetchAndPopulateComic({ start, perPage }) {
    const url = `https://intro-to-js-playground.vercel.app/api/xkcd-comics`;
    const allPromises = Array.from({ length: perPage }, (v, i) => {
      return fetch(`${url}/${Number(start) + i}`);
    });
    console.log({ allPromises });

    return Promise.allSettled(allPromises);
  }

  async function populateComic(comics, numberOfComics) {
    console.log({ comics, numberOfComics });
    const comicContainer = document.getElementById('comic');

    let i = 0;
    for (i; i < numberOfComics; i++) {
      const currentComic = comics[i];

      if (currentComic?.status === 'fulfilled' && currentComic?.value) {
        const data = await currentComic.value.json();
        populateSingleComicEl(data, i, comicContainer);
        continue;
      }
      // break out if no comic found
    }
  }

  function populateSingleComicEl(data, index, container) {
    console.log({ data, childrean: container.children });
    let comicItem;

    if (container?.children?.length > index) {
      comicItem = container.children[index];
    }

    if (!comicItem) {
      comicItem = createChildContainer(index, container);
    }

    const { safe_title, alt, img, transcript } = data;
    const imgEl = comicItem.getElementsByTagName('img')[0];
    imgEl.src = img;
    imgEl.title = safe_title;
  }

  function createChildContainer(index, container) {
    const comicItemContainer = document.createElement('div');
    comicItemContainer.setAttribute('id', `comic-${index + 1}`);

    const comicItemGraphic = document.createElement('img');
    comicItemContainer.appendChild(comicItemGraphic);

    container.appendChild(comicItemContainer);
    return comicItemContainer;
  }

  function handleEmptyComic() {
    disabledComicButtons();
    pageController.showError('No more comics');
  }

  function disabledComicButtons() {
    const comicButtons = document.querySelectorAll('.comic__button');
    comicButtons.forEach((el) => {
      el.disabled = true;
    });
  }
})();
