const defaultSettings = {
  perPage: 3,
  start: 1,
};

const createFetchQuery = function () {
  const query = utils.getUrlQuery();
  const start = Number(query.start);
  const perPage = parsePerPage(Number(query.perPage));

  function parsePerPage(page) {
    const invalidPageNumber =
      !page || !Number.isInteger(page) || (Number.isInteger(page) && page > 5);
    return invalidPageNumber ? defaultSettings.perPage : Number(page);
  }

  function getDefault() {
    return {
      start: start || defaultSettings.start,
      perPage: perPage || defaultSettings.perPage,
    };
  }

  function getPrevious() {
    const newPage = start - perPage;
    const finalPage = newPage > 0 ? newPage : 1;
    return { start: finalPage, perPage: perPage };
  }

  function getNext() {
    return { start: start + perPage, perPage };
  }

  function getRandom() {
    const sign = Math.random() > 0.5 ? 'add' : 'minus';
    const randomInt = utils.getRandomInt(3, 20);
    if (sign === 'add') {
      return { start: start + randomInt, perPage };
    } else {
      const newPage = start - randomInt;
      const finalPage = newPage > 0 ? newPage : start + randomInt;
      return { start: finalPage, perPage };
    }
  }

  function getPage(number) {
    const newNumber = Number(number) - Math.floor(perPage / 2);
    const _finalNumber = newNumber < 1 ? 1 : newNumber;

    return { start: _finalNumber, perPage };
  }

  function getSelection(numOfSelection) {
    return { start: start, perPage: numOfSelection };
  }

  return {
    query,
    getDefault,
    getPrevious,
    getNext,
    getRandom,
    getSelection,
    getPage,
  };
};

function initControlQueryAndPopulate(initialQuery) {
  const selectorDropdown = document.getElementById('count');
  const { perPage } = initialQuery;
  selectorDropdown.value = perPage;
}

(function comicReader() {
  // initial fetching
  const initialQuery = createFetchQuery().getDefault();
  initFetchComic(initialQuery);
  initControlQueryAndPopulate(initialQuery);

  const prevButton = document.getElementsByClassName('prev');
  const nextButton = document.getElementsByClassName('next');
  const randomButton = document.getElementsByClassName('random');

  const selectorDropdown = document.getElementById('count');
  const form = document.getElementById('page');

  createEventHandler(prevButton, 'getPrevious');
  createEventHandler(nextButton, 'getNext');
  createEventHandler(randomButton, 'getRandom');

  function createEventHandler(elementIterator, initType) {
    for (let el of elementIterator) {
      el.addEventListener('click', function () {
        initFetchComic(createFetchQuery()[initType]());
      });
    }
  }

  selectorDropdown.addEventListener('change', function (e) {
    const _value = Number(e.target.value);
    const { query, getSelection } = createFetchQuery();

    if (Number(query.perPage) > _value) {
      const comicContainer = document.getElementById('comic');
      removeImageNodeFromIndex(_value - 1, comicContainer);
      const newQuery = getSelection(_value);
      utils.updateURLParams(newQuery);
    } else {
      initFetchComic(getSelection(_value));
    }
  });

  const input = form.querySelector('input[name="pageNum"]');
  input.addEventListener('change', function () {
    pageController.hideFormError();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    try {
      var formData = Object.fromEntries(new FormData(form));
      const newPageNumber = parseInt(formData['pageNum']);

      if (newPageNumber < 0) {
        pageController.addFormError(`Negative number is not allowed`);
        return;
      }

      initFetchComic(createFetchQuery().getPage(newPageNumber));
    } catch (error) {
      console.error(`Issue with fetching: ${error}`);
      pageController.addFormError(error);
    }
  });

  async function initFetchComic(query) {
    enableComicButtons();

    utils.updateURLParams(query);

    clearAllComics();
    pageController.showLoadingIndicator();

    try {
      const comic = await fetchComic(query);

      if (!comic) {
        handleEmptyComic();
        return;
      }

      populateComic(comic, query.perPage);
      pageController.hideLoadingIndicator();
    } catch (error) {
      console.error(`Error encounter: ${error}`);
      disabledComicButtons();
      pageController.showError(error);
      pageController.hideLoadingIndicator();
    }
  }

  function enableComicButtons() {
    const footerButtons = document.querySelector('.buttons__footer');
    footerButtons.classList.replace('d-none', 'd-flex');

    const comicButtons = document.querySelectorAll('.comic__button');
    comicButtons.forEach((el) => {
      el.disabled = false;
    });
  }

  function clearAllComics() {
    const comicContainer = document.getElementById('comic');
    comicContainer.innerHTML = '';
  }

  function handleEmptyComic() {
    disabledComicButtons();
    pageController.showError('No more comics');
  }

  function disabledComicButtons() {
    const footerButtons = document.querySelector('.buttons__footer');
    footerButtons.classList.replace('d-flex', 'd-none');

    const comicButtons = document.querySelectorAll('.comic__button');
    comicButtons.forEach((el) => {
      el.disabled = true;
    });
  }

  function fetchComic({ start, perPage }) {
    const url = `https://intro-to-js-playground.vercel.app/api/xkcd-comics`;
    const allPromises = Array.from({ length: perPage }, (v, i) => {
      return fetch(`${url}/${Number(start) + i}`);
    });

    return Promise.allSettled(allPromises);
  }

  async function populateComic(comics, numberOfComics) {
    const comicContainer = document.getElementById('comic');

    let i = 0;
    for (i; i < numberOfComics; i++) {
      const currentComic = comics[i];

      if (currentComic?.status === 'fulfilled' && currentComic?.value?.status === 200) {
        const data = await currentComic.value.json();
        populateSingleComicEl(data, i, comicContainer);
        continue;
      }

      if (i === 0) {
        handleEmptyComic();
        break;
      }

      populateEnd(i, comicContainer);
      removeImageNodeFromIndex(i + 1, comicContainer);
      break;
    }
  }

  function populateSingleComicEl(data, index, container) {
    let comicItem;

    if (container?.children?.length > index) {
      comicItem = container.children[index];
      // the End tag will not have an image source
      if (container.children[index].getElementsByTagName('img').length === 0) {
        createImgAndTextAndAppend(comicItem);
      }
    }

    if (!comicItem) {
      comicItem = createChildContainer(index, container);
    }

    const { safe_title, alt, img, num } = data;
    const titleEl = comicItem.querySelector('.comic__title');
    titleEl.innerText = `${num}. ${safe_title}`;

    const imgEl = comicItem.getElementsByTagName('img')[0];
    imgEl.src = img;
    imgEl.title = alt;
    imgEl.setAttribute('data-num', num);
  }

  function createChildContainer(index, container) {
    const comicItemContainer = document.createElement('div');
    createImgAndTextAndAppend(comicItemContainer, index);
    container.appendChild(comicItemContainer);
    return comicItemContainer;
  }

  function createImgAndTextAndAppend(container, index) {
    container.innerText = '';
    container.classList.add('comic__container');
    container.setAttribute('id', `comic-${index + 1}`);
    const comicItemTitle = document.createElement('div');
    comicItemTitle.classList.add('comic__title', 'text-center', 'text-bold');
    const comicItemGraphic = document.createElement('img');
    container.append(comicItemTitle);
    container.appendChild(comicItemGraphic);
    return container;
  }

  function populateEnd(index, container) {
    let comicItem;

    if (container?.children?.length > index) {
      comicItem = container.children[index];
      comicItem.removeAttribute('id');
      comicItem.removeAttribute('data-num');
    }

    if (!comicItem) {
      comicItem = document.createElement('div');
      container.appendChild(comicItem);
    }

    comicItem.innerText = 'End';

    for (el of nextButton) {
      el.disabled = true;
    }
  }

  function removeImageNodeFromIndex(index, container) {
    if (container?.children?.length > index) {
      let i = index;
      for (i; i < container.children.length; i++) {
        const child = container.children[i];
        container.removeChild(child);
      }
    }
  }
})();
