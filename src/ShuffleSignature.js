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

      if (row.querySelector(".displayTableCell")?.textContent == "Exemplarsignaturtyp") {

        try {
          // not a nice solution but the only one that worked.
          // set the value directly was possible but does not worked. the value was there and visible
          // but it was not been saved to the database and after a reload the value disappeared
          row.querySelector(".displayTableCell").click();
          setTimeout(() => {
            row.querySelector(".input-group-btn > button").click();

            setTimeout(() => {
              row.querySelector("li[title='Anderes Schema']").click();
            }, 200);
          }, 200);
        } catch (e) {
          console.log("exception: ", e);
        }
      }
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

function isValidPlaceForShuffle() {
  const pageTitle = document.querySelector(".pageTitle").innerText;

  return pageTitle == "Editor für physische Exemplare";
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
  if (!isValidPlaceForShuffle())
    return;

  const shuffleButton = `
     <div class="pull-right marLeft10">
       <button id="PAGE_BUTTONS_cbuttonshuffle"
               class="btn btn-secondary jsBlockScreen jsToolTipDelayed jsHotkeyHint"
               onclick="event.preventDefault(); window.postMessage({art: 'tug-shuffle'}, '*'); return false;" title="Exemplarsignatur vom Holding in Exemplarsignatur schreiben">
         852h einfügen
       </button>
     </div>
  `;

  const domParser = new DOMParser(),
        html = domParser.parseFromString(shuffleButton, "text/html");

  const firstElement = document.querySelector(".btnWrapper .pull-right");

  if (firstElement)
    firstElement.parentNode.insertBefore(html.body.firstChild, firstElement.nextSibling);
}

window.addEventListener("message", shuffleSignature);
window.loadingBlockerEvents.push(addButtonShuffleSignature);
