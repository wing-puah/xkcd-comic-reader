const pageController = (function () {
  const loadingIndicator = document.querySelector('.lds-spinner___container');
  function showLoadingIndicator() {
    loadingIndicator.classList.replace('d-none', 'd-flex');
  }

  function hideLoadingIndicator() {
    loadingIndicator.classList.replace('d-flex', 'd-none');
  }

  let timerId;
  function showError(errorMessage) {
    console.log('showing');
    clearTimeout(timerId);
    const snackbar = document.querySelector('.snackbar');
    snackbar.innerText = errorMessage;
    snackbar.classList.replace('d-none', 'd-block');

    timerId = setTimeout(function () {
      hideError();
    }, 3000);
  }
  function hideError() {
    console.log('hiding');
    const snackbar = document.querySelector('.snackbar');
    snackbar.classList.replace('d-block', 'd-none');
  }

  function addFormError(error) {
    const errorEl = document.querySelector('form .error');
    const errorText = typeof error === 'string' ? error : JSON.stringify(error);
    errorEl.innerText = errorText;
    errorEl.classList.replace('display-none', 'display-inline');
  }

  function hideFormError() {
    const errorEl = document.querySelector('form .error');
    errorEl.innerText = '';
    errorEl.classList.replace('display-inline', 'display-none');
  }

  return {
    showLoadingIndicator,
    hideLoadingIndicator,
    showError,
    hideError,
    addFormError,
    hideFormError,
  };
})();
