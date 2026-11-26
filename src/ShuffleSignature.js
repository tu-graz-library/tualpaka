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
 * MW - Anpassung an Alma November 2026 Release 
 * 
 **/

class ShuffleSignature {
  
  insertIntoExemplarSignature(signature) {
    const fields = document.querySelectorAll(".form-field-wrapper");
    
    for (const field of fields) {
      if (
        field.querySelector(".form-field-label")?.textContent == "Exemplarsignaturtyp"
      ) {
        try {
          // not a nice solution but the only one that worked.
          // set the value directly was possible but does not worked. the value was there and visible
          // but it was not been saved to the database and after a reload the value disappeared
          field.querySelector(".mat-mdc-menu-trigger").click();
          setTimeout(() => {
            const fieldnew = document.querySelector("mat-radio-group");
            fieldnew.querySelector("button[aria-label='Anderes Schema Ebene 1']").click();
          }, 200);
        } catch (e) {
          console.log("exception: ", e);
        }
      }
      if (field.querySelector(".form-field-label")?.textContent == "Exemplar-Signatur") {
        typeInto(field.querySelector("input"), signature.signature);
      }
    }
  }
  
}

class ExtractSignature {
  constructor() {
    const fields = document.querySelector(".sel-id-physical-items-summary-section-holdings");
    const text = fields.querySelector("a").textContent;    
    this.signature_ = text.split(";").pop().trim();
  }

  get signature() {
    return this.signature_;
  }
}

function typeInto(el, text) {
  el.focus();
  const setter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(el), 'value'
  ).set;

  let current = '';
  for (const ch of text) {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keypress', { key: ch, bubbles: true }));

    current += ch;
    setter.call(el, current);
    el.dispatchEvent(new InputEvent('input', {
      data: ch, inputType: 'insertText', bubbles: true
    }));

    el.dispatchEvent(new KeyboardEvent('keyup', { key: ch, bubbles: true }));
  }
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.blur(); // löst "touched" aus
}

function isValidPlaceForShuffle() {
  const detailsWizardIdentifier = document.querySelectorAll(".ex-section-edit");
  
  return (
    detailsWizardIdentifier.length != 0
  );
}


function shuffleSignature(message) {
  if (!message.data || message.data.art != "tug-shuffle") {
    return;
  }

  const signature = new ExtractSignature();
  const shuffle = new ShuffleSignature();

  shuffle.insertIntoExemplarSignature(signature);
}

// REFACTOR: Label.js addButtonPrintLabel create a abstraction
function addButtonShuffleSignature() {
  
  if (!isValidPlaceForShuffle()) {
    return;
  }
  
  const menu = document.querySelector(".sel-id-physical-items-summary-section-holdings");
    
  if (!menu) return;
  if (menu.querySelector("[shuffle-signature]")) return;

  const shuffleButton = `
     <div>
       <a id="PAGE_BUTTONS_cbuttonshuffle" class="mat-mdc-tooltip-trigger ex-link-anchor sel-ex-link-anchor ex-link-anchor-normal"
               href="#" onclick="event.preventDefault(); window.postMessage({art: 'tug-shuffle'}, '*'); return false;" title="Exemplarsignatur vom Holding in Exemplarsignatur schreiben">
         (852h einfügen)
       </a>
     </div>
    `;

  const domParser = new DOMParser();
  const html = domParser.parseFromString(shuffleButton, "text/html");

  const node = html.body.firstChild;
  node.setAttribute("shuffle-signature","true");
  menu.appendChild(node);

}

window.addEventListener("message", shuffleSignature);

let scheduledShuffle = false;
const observerShuffle = new MutationObserver(() => {
  if (scheduledShuffle) return;
  scheduledShuffle = true;
  requestAnimationFrame(() => {
    scheduledShuffle = false;
    addButtonShuffleSignature();
  });
});

observerShuffle.observe(document.body, { childList: true, subtree: true });
addButtonShuffleSignature(); // erster Versuch

//window.loadingBlockerEvents.push(addButtonShuffleSignature);
