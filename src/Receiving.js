/**
 * Copyright (C) 2020 Christoph Ladurner, Technische Universität Graz, Bibliothek
 *
 * To print the labels in Alma the user has search with "Physische
 * Exemplare". Then every physical items occur in the result list. The
 * Print Label button is then on the right side on every result item
 * hidden behind the three points.
 *
 * This extension only works with the German language package in Alma.
 *
 *
 **/

function overrideEnterForReceiving() {
  const pageTitle = document.querySelector(".pageTitle").innerText;

  if (pageTitle != "Liste erhaltener Exemplare")
    return;

  const overrideEnter = (event) => {
    event.preventDefault();

    event.target.parentNode.parentNode.querySelector("a[title='Eingang']").click();

    return false;
  };

  document
    .querySelectorAll("input.textField")
    .forEach(ele => ele.addEventListener("keypress", overrideEnter));
}

window.loadingBlockerEvents.push(overrideEnterForReceiving);
