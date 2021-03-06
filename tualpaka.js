/**
 * Copyright (C) 2020 Christoph Ladurner, Technische Universität Graz, Bibliothek
 **/


function init() {
  const mutationCallback = () => { window.loadingBlockerEvents.forEach(fn => fn()); };

  const target = document.querySelector("#loadingBlockerStatusIdentifier"),
        config = {attributes: true},
        observer = new MutationObserver(mutationCallback);

  observer.observe(target, config);
}


init();
