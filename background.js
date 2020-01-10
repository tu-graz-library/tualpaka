/***
 * Copyright (C) 2020 Christoph Ladurner, Technische Universität Graz, Bibliothek
 ***/

// think where this could be set instead
log.enableAll(); // equal to log.setLevel("trace")

function handleMessage(request, sender, sendResponse) {
  if (request.ns == "tug") {
    return TUGMessageHandler.receiveMessage(request, sender, sendResponse);
  }

  return true;
}

browser.runtime.onMessage.addListener(handleMessage);


browser.contextMenus.create({
  id: "print-user",
  title: "print the user"
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId == "print-user")
    browser.tabs.executeScript({code: "printUser()"});
});
