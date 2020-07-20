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
