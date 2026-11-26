/**
 * Copyright (C) 2020-2021 Christoph Ladurner, Technische Universität Graz, Bibliothek
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
 * MW - Anpassung an Alma November 2026 Release 
 *
 **/

class Record {
  constructor(data) {
    this.data = data;

    if (this.doSwap()) {
      this.swapSubMain();
    }

    this.setIfTwoOrOneLabel();
    this.beautifySignature();
  }

  set data(val) {
    this._data = val;
  }

  get data() {
    return this._data;
  }

  setIfTwoOrOneLabel() {
    this._data.beside = this._data.hasOwnProperty("sub");
  }

  beautifySignature() {
    if (!/^Z?(I|II|III|IIII|IV)(\+NB)?$/.test(this._data.main.signature[0])) {
      return;
    }
    const arr = this.addThousandDelimiter(this._data.main.signature[1]);

    this._data.main.signature[1] = arr[0];
    if (arr.length == 2) {
      this._data.main.signature.splice(2, 0, ...arr.slice(1));
    }
  }

  addThousandDelimiter(signature) {
    let pos = signature.indexOf("/");
    pos = pos === -1 ? signature.length : pos;

    let signatureWithThousandDelimiter = new Intl.NumberFormat("de-DE").format(
      signature.substring(0, pos)
    );
    let returnValue = [signatureWithThousandDelimiter];

    if (pos < signature.length) {
      returnValue[0] += "/";
      returnValue[1] = signature.substring(pos + 1);
    }

    return returnValue;
  }

  doSwap() {
    return false;
  }

  swapSubMain() {
    if (!this._data.hasOwnProperty("sub")) {
      return;
    }

    [this._data.main, this._data.sub] = [this._data.sub, this._data.main];
  }
}

class Book extends Record {
  constructor(data) {
    super(data);

    this.removeElementsForInstituteLabel();
    this.addSlashToSignatureIfNecessary();
    this.mergeToLongSignature();
  }

  removeElementsForInstituteLabel() {
    const libraryNameContainInstituteNumber = /\d{4,5}/.test(this._data.main.library);

    if (libraryNameContainInstituteNumber) {
      delete this._data.main.library;
      delete this._data.main.location;
    }

    if (libraryNameContainInstituteNumber && this._data.hasOwnProperty("sub")) {
      delete this._data.sub.library;
      delete this._data.sub.location;
    }
  }

  addSlashToSignatureIfNecessary() {
    if (this._data.main.description && this._data.main.signature[1].slice(-1) != "/") {
      this._data.main.signature[1] += "/";
    }
  }

  mergeToLongSignature() {
    if (this._data.main.signature.length > 3) {
      this._data.main.signature[2] = this._data.main.signature.splice(2).join(" ");
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

    this._data.sub.location.text = "TUG HS";
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

    this._data.sub.location.text = "HB 03";
  }
}

class HB22 extends Book {
  constructor(data) {
    super(data);

    this._data.sub.location.text = "HB 22";
  }
}

class HB21 extends Book {
  constructor(data) {
    super(data);

    this._data.sub.location.text = "HB 21";
  }
}

class Dissertation extends Book {
  constructor(data) {
    super(data);
  }

  beautifySignature() {
    this._data.main.signature.forEach((element, index, signature) => {
      const arr = this.addThousandDelimiter(element);
      signature[index] = arr[0];
      if (arr.length == 2) {
        signature.splice(index + 1, 0, ...arr.slice(1));
      }
    });
  }
}

class FacultyLibrary extends Book {
  constructor(data) {
    super(data);

    delete this._data.beside;
    delete this._data.sub;
  }

  doSwap() {
    return true;
  }
}

class Journal extends Record {
  constructor(data) {
    super(data);

    this.removeLocationFromDisplay();
    this.convertInstituteTitle();
  }

  removeLocationFromDisplay() {
    this._data.main.location.style = "empty";
  }

  convertInstituteTitle() {
    const number = /\d{4,4}/.exec(this._data.main.library);

    if (number !== null && !isNaN(parseInt(number[0]))) {
      this._data.main.library = `F${number}`;
    }
  }
}

class Label {
  constructor(metadata) {
    this.metadata = metadata;

    this.labelArts = new Map([
      ["Institutsbibliothek", FacultyLibrary],
      ["FHA", FHA],
      ["TUGHS", TUGHS],
      ["ARCH", ARCH],
      ["LBS", LBS],
      ["HB03", HB03],
      ["HB22", HB22],
      ["HB21", HB21],
    ]);
  }

  get rawData() {
    let data = {};
    if (this.metadata.itemSignature && this.metadata.signature) {
      data = {
        main: {
          library: this.metadata["library"],
          signature: this.metadata["itemSignature"],
          description: this.metadata["description"],
        },
        sub: {
          library: this.metadata["library"],
          signature: this.metadata["signature"],
          location: { text: this.metadata["location"], style: "" },
        },
      };
    } else if (this.metadata.signature) {
      data = {
        main: {
          library: this.metadata["library"],
          signature: this.metadata["signature"],
          location: { text: this.metadata["location"], style: "" },
          description: this.metadata["description"],
        },
      };
    }

    return data;
  }

  retrieveData() {
    let location = this.metadata["location"];
    let data = this.rawData;
    let record;

    if (data.main.signature[0] == "25000") {
      record = new Dissertation(data);
    } else if (data.main.signature[0][0] == "Z") {
      record = new Journal(data);
    } else if (this.labelArts.has(location)) {
      record = new (this.labelArts.get(location))(data);
    } else {
      record = new Book(data);
    }

    return record.data;
  }
}

class CollectMetadataFromHtml {
  constructor(id) {
    this.id = id;
  }

  get metadata() {
    const recordOuterContainer = document.querySelector(`#${this.id}`);
    const rowElements = recordOuterContainer.querySelectorAll(".ex-label-value");
    let metadata = {};

    for (const rowElement of rowElements){
      if (rowElement.querySelectorAll(".sel-label").length > 0){
        const exlabel = rowElement.querySelector(".sel-label");
        const exvalue = rowElement.querySelector(".sel-value");
      
        if (exlabel.innerText == "Permanente Bibliothek") {
          metadata["library"] = exvalue.innerText;
        }
        if (exlabel.innerText == "Signatur") {
          metadata["signature"] = exvalue.innerText.split(" ");
        }
        if (exlabel.innerText == "Exemplar-Signatur") {
          metadata["itemSignature"] = exvalue.innerText.split(" ");
        }
        if (exlabel.innerText == "Beschreibung") {
          const parts = exvalue.innerText.split(",");

          metadata["description"] = isNaN(parseInt(parts.slice(-1)))
            ? parts
            : [parts.join(",")];
        }

        if (exlabel.innerText == "Permanenter Standort") {
          const matches = exvalue.innerText.match(/\(.*?\)/);
          if (matches) {
            metadata["location"] = matches[0].replace(/[\(\)]/g, "");
          }

          if (exvalue.innerText == "Institutsbibliothek") {
            metadata["location"] = exvalue.innerText;
          }
        }
      }
    }

    return metadata;
  }
} 

function addButtonPrintLabel() {
  document.querySelectorAll("ex-new-record").forEach((element) => {
    
    const menu = document.querySelector(".menu-item-wrapper");
    
    if (!menu) return;
    if (menu.querySelector("[data-print-label]")) return;
    
    const span = `
                <span class="mat-mdc-tooltip-trigger ng-star-inserted">
                  <span class="mat-mdc-menu-item-text">
                    <a class="mat-mdc-menu-item  mat-focus-indicator mat-mdc-tooltip-trigger ex-record-actions-item sel-record-actions-button" href="#" style="text-decoration: none;" onclick="event.preventDefault(); window.postMessage({id: '${element.id}', art: 'tug-label'}, '*'); return false;">
                      Etikett drucken
                    </a>
                  </span>
                </span>
            `;  

    const domParser = new DOMParser();
    const html = domParser.parseFromString(span, "text/html");
    const node = html.body.firstChild;
    node.setAttribute("data-print-label","true")
    menu.appendChild(node)


  });
}

function insertAt(str, pos, sub) {
  return `${str.slice(0, pos)}${sub}${str.slice(pos)}`;
}

// printHtml from UserManagement:
// refactor to place such functions in a common file

async function printLabel(message) {
  if (!message.data || message.data.art != "tug-label") {
    return;
  }

  const metadata = new CollectMetadataFromHtml(message.data.id);
  const label = new Label(metadata.metadata);
  const data = label.retrieveData();

  const tag = await browser.runtime.sendMessage({
    ns: "tug",
    action: "tpl",
    data: "label",
  });
  const tpl = Handlebars.compile(tag);
  const html = tpl(data);

  printHtml(html);
}

window.addEventListener("message", printLabel);


let scheduled = false;
const observer = new MutationObserver(() => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    addButtonPrintLabel();
  });
});

observer.observe(document.body, { childList: true, subtree: true });
addButtonPrintLabel(); // erster Versuch

//window.loadingBlockerEvents.push(addButtonPrintLabel);
