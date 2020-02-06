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

class Book {
  constructor(data) {
    this.data = data;

    this.setIfTwoOrOneLabel();
    this.beautifySignature();
    this.removeElementsForInstituteLabel();
  }

  set data(val) {
    this._data = val;
  }

  get data() {
    return this._data;
  }

  setIfTwoOrOneLabel() {
    this._data.beside = this._data.hasOwnProperty('sub');
  }

  beautifySignature() {
    if (/I|II|III|IIII|IV/.test(this._data.main.signature[0])) {
      let obj = this._data.main,
          sig = obj.signature[1],
          pos = sig.indexOf("/");
      pos = pos === -1 ? sig.length : pos;

      obj.signature[1] = new Intl.NumberFormat('de-DE').format(sig.substring(0, pos));

      if (pos < sig.length) {
        obj.signature[1] += '/';
        obj.signature.splice(1+1, 0, sig.substring(pos+1));
      }

      if (obj.description && obj.signature[1].slice(-1) != '/')
        obj.signature[1] += '/';
    }
  }

  removeElementsForInstituteLabel() {
    const libraryNameStartsWithInstituteNumber = /^\d{4,4}.*$/.test(this._data.main.library);

    if (libraryNameStartsWithInstituteNumber) {
      delete this._data.main.library;
      delete this._data.main.location;
    }
  }
}

class FHA extends Book {
  constructor(data) {
    super(data);
  }
}

class TUGHS extends Book {
  constructor(data) {
    super(data);

    this._data.sub.location.text = 'TUG HS';
  }
}

class ARCH extends Book {
  constructor(data) {
    super(data);
  }
}

class LBS extends Book {
  constructor(data) {
    super(data);
  }
}

class HB03 extends Book {
  constructor(data) {
    super(data);

    this._data.sub.location.text = 'HB 03';
  }
}

class HB22 extends Book {
  constructor(data) {
    super(data);

    this._data.sub.location.text = 'HB 22';
  }
}

class HB21 extends Book {
  constructor(data) {
    super(data);

    this._data.sub.location.text = 'HB 21';
  }
}

class BookSpecifis {
  static setIfTwoOrOneLabel(data) {
    data.beside = data.hasOwnProperty('sub');
  }

  static beautifySignature(data) {
    const beautify = (obj) => {
      obj.signature.forEach((sig, index) => {
        if (!isNaN(sig) || /\d.*\/.+/.test(sig)) {
          let pos = sig.indexOf("/");
          pos = pos === -1 ? sig.length : pos;

          obj.signature[index] = new Intl.NumberFormat('de-DE').format(sig.substring(0, pos));

          if (pos < sig.length) {
            obj.signature[index] += '/';
            obj.signature.splice(index+1, 0, sig.substring(pos+1));
          }

          if (obj.description && obj.signature[index].slice(-1) != '/')
            obj.signature[index] += '/';
        }
      });
    };

    if (data.main)
      beautify(data.main);

    if (data.sub)
      beautify(data.sub);
  }

  static async removeElementsForInstituteLabel(data) {
    const storage = await browser.storage.local.get('tualpaka'),
          tualpaka = storage && storage.tualpaka ? storage.tualpaka : {mainLibrary: "", subLibraries: []},
          libraries = [tualpaka.mainLibrary, ...tualpaka.subLibraries];

    const libraryNameStartsWithInstituteNumber = /\d{4,4}.*/.test(data.main.library),
          libraryNameIsInExcludList = libraries.includes(data.main.library);

    if (libraryNameStartsWithInstituteNumber || libraryNameIsInExcludList) {
      delete data.main.library;
      delete data.main.location;
    }
  }

  static async apply(data) {
    this.setIfTwoOrOneLabel(data);
    this.beautifySignature(data);
    await this.removeElementsForInstituteLabel(data);
  }
}

class JournalSpecifics {
  static removeLocationFromDisplay(data) {
    data.main.location.style = 'empty';
  }

  static convertInstituteTitle(data) {
    if (!isNaN(parseInt(data.main.library)))
      data.main.library = 'F' + parseInt(data.main.library);
  }

  static apply(data) {
    this.removeLocationFromDisplay(data);
    this.convertInstituteTitle(data);
  }
}

class Label {
  constructor(id) {
    this.id = id;

    this.labelArts = new Map([
      ['FHA', FHA],
      ['TUGHS', TUGHS],
      ['ARCH', ARCH],
      ['LBS', LBS],
      ['HB03', HB03],
      ['HB22', HB22],
      ['HB21', HB21]
    ]);
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

      if (items[0].trim() == "Beschreibung") {
        const parts = items[1].trim().split(',');

        lines["description"] = isNaN(parseInt(parts.slice(-1))) ? parts : [parts.join(',')];
      }

      if (items[0].trim() == "Permanenter Standort") {
        const matches = items[1].match(/\(.*?\)/);
        if (matches)
          lines["location"] = matches[0].replace(/[\(\)]/g, '');
      }
    }

    return lines;
  }

  async retrieveData() {
    let obj = this.lines,
        data = {},
        location = obj["location"];

    if (obj.itemSignature && obj.signature)
      data = {
        main: {
          library: obj["library"],
          signature: obj["itemSignature"],
          description: obj["description"]
        },
        sub: {
          library: obj["library"],
          signature: obj["signature"],
          location: {text: obj["location"], style: ''}
        }
      };

    else if (obj.signature)
      data = {
        main: {
          library: obj["library"],
          signature: obj["signature"],
          location: {text: obj["location"], style: ''},
          description: obj["description"]
        }
      };

    if (this.labelArts.has(location)) {
      const k = new (this.labelArts.get(location))(data);
      data = k.data;
    } else if (data.main.signature[0][0] == "Z")
      JournalSpecifics.apply(data);
    else
      await BookSpecifis.apply(data);

    return data;
  }
}



function addButtonPrintLabel() {
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
        data = await label.retrieveData();

  const tag = await browser.runtime.sendMessage({ns: 'tug', action: 'tpl', data: 'label'}),
        tpl = Handlebars.compile(tag),
        html = tpl(data);

  printHtml(html);
}

window.addEventListener("message", printLabel);
window.loadingBlockerEvents.push(addButtonPrintLabel);
