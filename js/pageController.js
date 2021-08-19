const pageController = (function () {
  function showLoadingIndicator() {
    console.log('show');
  }
  function hideLoadingIndicator() {}
  function showError(errorMessage) {}
  function hideError() {}

  return { showLoadingIndicator, hideLoadingIndicator, showError, hideError };
})();
