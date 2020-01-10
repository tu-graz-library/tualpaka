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
 * The templates for the labels are created for TU Graz.
 *
 **/

(function () {
  const mutationCallback = function () {
    document.querySelectorAll(".recordOuterContainer").forEach((element) => {
      const li = `
                <li class="rowAction internalRowAction">
                  <a class="submitUrl" href="#" onclick="event.preventDefault(); window.postMessage({id: '${element.id}', art: 'tug-label'}, '*'); return false;">
                    Print Label
                  </a>
                </li>
            `;

      const domParser = new DOMParser(),
            html = domParser.parseFromString(li, "text/html");

      element.querySelector(".dropdown-menu").appendChild(html.body.firstChild);
    });
  };

  const target = document.querySelector("#loadingBlockerStatusIdentifier"),
        config = {attributes: true},
        observer = new MutationObserver(mutationCallback);

  observer.observe(target, config);
})();

class Label {
  constructor(id) {
    this.id = id;
  }

  get lines() {
    const recordOuterContainer = document.querySelector(`#${this.id}`),
          rowElements = recordOuterContainer.querySelectorAll(".col-xs-12");

    let lines = {};

    for (const rowElement of rowElements) {
      const items = rowElement.innerText.split(":");

      if (items[0].trim() == "Bibliothek")
        lines["library"] = items[1].trim();

      if (items[0].trim() == "Signatur")
        lines["signature"] = items[1].trim().split(' ');

      if (items[0].trim() == "Exemplarsignatur")
        lines["itemSignature"] = items[1].trim().split(' ');

      if (items[0].trim() == "Permanenter Standort") {
        const matches = items[1].match(/\(.*?\)/);
        if (matches)
          lines["location"] = matches[0].replace(/[\(\)]/g, '');
      }
    }

    return lines;
  }

  setIfTwoOrOneLabel(data) {
    data.beside = data.hasOwnProperty('sub');
  }

  beautifySignature(data) {
    const signature_prefixes = ["I", "II", "III", "IV", "IIII", "ZI", "ZII", "ZIII", "ZIV"];

    const beautify = (sig) => {
      if (signature_prefixes.includes(sig[0])) {
        let pos = sig[1].indexOf("/");
        pos = pos === -1 ? sig[1].length : pos;

        sig[1] = new Intl.NumberFormat('de-DE').format(sig[1].substring(0, pos)) + sig[1].substring(pos);
      }

      if (sig[0][0] == "Z")
        sig[0] = `${sig[0][0]} ${sig[0].slice(1)}`;
    };

    if (data.main)
      beautify(data.main.signature);

    if (data.sub)
      beautify(data.sub.signature);
  }

  async removeElementsForInstituteLabel(data) {
    const storage = await browser.storage.local.get('tualpaka'),
          libraries = [storage.mainLibrary, ...storage.subLibraries];

    if (libraries.includes(data.main.library)) {
      delete data.main.library;
      delete data.main.location;
    }
  }

  retrieveData() {
    let obj = this.lines,
        data = {};

    if (obj.itemSignature && obj.signature)
      data = {
        main: {
          library: obj["library"],
          signature: obj["itemSignature"]
        },
        sub: {
          library: obj["library"],
          signature: obj["signature"],
          location: obj["location"]
        }
      };

    else if (obj.signature)
      data = {
        main: {
          library: obj["library"],
          signature: obj["signature"],
          location: obj["location"]
        }
      };


    this.setIfTwoOrOneLabel(data);
    this.beautifySignature(data);
    this.removeElementsForInstituteLabel(data);

    return data;
  }
}

function insertAt(str, pos, sub) {
  return `${str.slice(0, pos)}${sub}${str.slice(pos)}`;
}

// printHtml from UserManagement:
// refactor to place such functions in a common file

async function printLabel(message) {
  if (!message.data || message.data.art != "tug-label")
    return;

  const label = new Label(message.data.id),
        data = label.retrieveData();

  const tag = await browser.runtime.sendMessage({ns: 'tug', action: 'tpl', data: 'label'}),
        tpl = Handlebars.compile(tag),
        html = tpl(data);

  printHtml(html);
}

window.addEventListener("message", printLabel);
