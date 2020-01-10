/**
 * Copyright (C) 2020 Christoph Ladurner, Technische Universität Graz, Bibliothek
 **/

class UserManagement {
  retrieveData() {
    let data = {};

    data["id"] = document.querySelector("#SPAN_SELENIUM_ID_identifiersList_ROW_0_COL_userIdentifiervalue").innerText.toUpperCase();
    data["name"] = document.querySelector("#pageBeanname").innerText;
    data["currentDate"] = currentDate();

    return data;
  }
}

function currentDate() {
  const today = new Date(),
        dd = String(today.getDate()).padStart(2, '0'),
        mm = String(today.getMonth() + 1).padStart(2, '0'), //January is 0!
        yyyy = today.getFullYear();

  return mm + '/' + dd + '/' + yyyy;
}

function printHtml(html) {
  const iframe = document.createElement("iframe");
  iframe.style.display = 'none';
  iframe.src = 'data:text/html;charset=utf-8,'+html;
  document.body.appendChild(iframe);
}

async function printUser(e) {
  const pageTitle = document.querySelector(".pageTitle").innerText,
        detailsWizardIdentifier = document.querySelector("#cuseruser_detailswizardidentifier_span").getAttribute("aria-selected");

  if (pageTitle == "Benutzerdetails" && detailsWizardIdentifier == "true") {
    const userManagement = new UserManagement(),
          data = userManagement.retrieveData();

    const tag = await browser.runtime.sendMessage({ns: 'tug', action: 'tpl', data: 'user'});

    const tpl = Handlebars.compile(tag),
          html = tpl(data);

    printHtml(html);
  }
  else
    alert("Um Benutzerkarten auszudrucken müssen Sie auf die Seite Benutzerdetails gehen und auf Kennungen klicken.");
}
