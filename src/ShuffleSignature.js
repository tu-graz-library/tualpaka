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
 **/

class ShuffleSignature {
  insertIntoExemplarSignature(signature) {
    const rows = document.querySelectorAll(".row");

    for (const row of rows) {
      if (row.querySelector(".displayTableCell")?.textContent == "Exemplarsignatur")
        row.querySelector("input").value = signature.signature;

      if (row.querySelector(".displayTableCell")?.textContent == "Exemplarsignaturtyp")
        row.querySelector("input").value = "Anderes Schema";
    }
  }
}

class ExtractSignature {
  constructor(row) {
    const rows = document.querySelectorAll(".row");

    for (const row of rows) {
      if (row.querySelector(".displayTableCell")?.textContent == "Lokalsatz") {
        const text = row.querySelector("a").textContent;
        this.signature_ = text.split(";").pop().trim();
      }
    }
  }

  get signature() {
    return this.signature_;
  }
}

function shuffleSignature(message) {
  if (!message.data || message.data.art != "tug-shuffle")
    return;

  const shuffle = new ShuffleSignature();
  const signature = new ExtractSignature();

  shuffle.insertIntoExemplarSignature(signature);
}

// REFACTOR: Label.js addButtonPrintLabel create a abstraction
function addButtonShuffleSignature() {
  const shuffleButton = `
     <div class="pull-right marLeft10">
       <button id="PAGE_BUTTONS_cbuttonshuffle" class="" onclick="event.preventDefault(); window.postMessage({art: 'tug-shuffle'}, '*'); return false;" title="Exemplarsignatur vom Holding in Exemplarsignatur schreiben">ExpSig. Shuffle</button>
     </div>
  `;

  const domParser = new DOMParser(),
        html = domParser.parseFromString(shuffleButton, "text/html");

  const cancelButton = document.getElementById("PAGE_BUTTONS_cbuttoncancel");

  if (cancelButton)
    cancelButton.parentNode.insertBefore(html.body.firstChild, cancelButton);
}

window.addEventListener("message", shuffleSignature);
window.loadingBlockerEvents.push(addButtonShuffleSignature);
