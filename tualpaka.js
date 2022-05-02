/**
 * Copyright (C) 2020 Christoph Ladurner, Technische Universität Graz, Bibliothek
 **/

function init() {
  const mutationCallback = () => {
    window.loadingBlockerEvents.forEach((fn) => fn());
  };

  const target = document.querySelector("#loadingBlocker");
  const config = { attributes: true };
  const observer = new MutationObserver(mutationCallback);

  observer.observe(target, config);
}

window.setTimeout(init, 6000);
