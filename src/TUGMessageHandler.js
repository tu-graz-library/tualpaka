/**
 * Copyright (C) 2020 Christoph Ladurner, Technische Universität Graz, Bibliothek
 **/

class TUGMessageHandler {
  static receiveMessage(msg, sender, sendResponse) {
    if (!msg || !msg.action || !TUGMessageHandler.hasOwnProperty(msg.action)) {
      throw "No Handler for message";
      log.warn(`no handler message: ${JSON.stringify(msg)}`);
    }

    return TUGMessageHandler[msg.action](msg, sender, sendResponse);
  }

  static tpl(msg, sender, sendResponse) {
    const request = new Request(`/tpl/${msg.data}.tpl`);
    const fetchAllTemplates = [fetch(request).then((x) => x.text())];
    const thenDo = ([tpl]) => {
      sendResponse(tpl);
    };

    Promise.all(fetchAllTemplates).then(thenDo);

    // true is neccessary to use sendResponse in the Promise context
    return true;
  }
}
