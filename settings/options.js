/**
 * Copyright (C) 2020 Christoph Ladurner, Technische Universität Graz, Bibliothek
 **/

function saveOptions(e) {
  e.preventDefault();

  const settings = {
    tualpaka: {}
  };

  browser.storage.local.set(settings);
}

async function restoreOptions() {
  const localStorage = await browser.storage.local.get('tualpaka'),
        tualpaka = localStorage.tualpaka || {};
}

function i18n() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.innerHTML = browser.i18n.getMessage(element.dataset.i18n);
  });
}

function init() {
  document.querySelector('form').addEventListener('submit', saveOptions);

  restoreOptions();
  i18n();
}

document.addEventListener('DOMContentLoaded', init);


