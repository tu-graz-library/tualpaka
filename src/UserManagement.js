/**
 * Copyright (C) 2020-2021 Christoph Ladurner, Technische Universität Graz, Bibliothek
 **/

class UserManagement {
  retrieveData() {
    let data = {};

    data["id"] = this.extractBarcode();
    data["name"] = document.querySelector("#pageBeanname").innerText;
    data["currentDate"] = currentDate();

    return data;
  }

  extractBarcode() {
    const labels = document.querySelectorAll("#TABLE_DATA_identifiersList .labelField");

    return [...labels]
      .map((span) => span.innerText.toUpperCase())
      .filter((label) => label[0] == "$")[0];
  }
}

function currentDate() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = today.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
}

function printHtml(html) {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = `data:text/html;charset=utf-8,${html}`;
  document.body.appendChild(iframe);
}

function isValidPlaceForPrint() {
  const pageTitle = document.querySelector(".pageTitle").innerText;
  const detailsWizardIdentifier = document
    .querySelector("#cuseruser_detailswizardidentifier_span a")
    ?.getAttribute("aria-selected");

  return pageTitle == "Benutzerdetails" && detailsWizardIdentifier == "true";
}

async function printUser(message) {
  if (!message.data || message.data.art != "tug-printUser") {
    return;
  }

  const userManagement = new UserManagement();
  const data = userManagement.retrieveData();

  const tag = await browser.runtime.sendMessage({
    ns: "tug",
    action: "tpl",
    data: "user",
  });

  const tpl = Handlebars.compile(tag);
  const html = tpl(data);

  printHtml(html);
}

function addButtonPrintUser() {
  if (!isValidPlaceForPrint()) {
    return;
  }

  const button = `
    <div class="pull-right marLeft10">
      <button id="PAGE_BUTTONS_cbuttonprintuser"
              class="btn btn-secondary jsBlockScreen jsToolTipDelayed jsHotkeyHint"
              onclick="event.preventDefault(); window.postMessage({art: 'tug-printUser'}, '*'); return false;" title="Print the User">
        Benutzer Drucken
      </button>
    </div>
  `;

  const domParser = new DOMParser();
  const html = domParser.parseFromString(button, "text/html");

  const firstElement = document.querySelector(".btnWrapper .pull-right");

  if (firstElement) {
    firstElement.parentNode.insertBefore(
      html.body.firstChild,
      firstElement.nextSibling
    );
  }
}

window.addEventListener("message", printUser);
window.loadingBlockerEvents.push(addButtonPrintUser);
