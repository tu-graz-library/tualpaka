/**
 * Copyright (C) 2020 Christoph Ladurner, Technische Universität Graz, Bibliothek
 **/

function saveOptions(e) {
  e.preventDefault();

  const settings = {
    tualpaka: {
      mainLibrary: document.querySelector('#mainLibrary').value,
      subLibraries: document.querySelector('#subLibraries').value.split(':').map(str => str.trim())
    }
  };

  browser.storage.local.set(settings);
}

async function restoreOptions() {
  const localStorage = await browser.storage.local.get('tualpaka'),
        tualpaka = localStorage.tualpaka || {};

  document.querySelector("#mainLibrary").value = tualpaka.mainLibrary || '';
  document.querySelector("#subLibraries").value = (tualpaka.subLibraries || []).join(' : ');
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


