/* global chrome */

export const pubMessage = (message, tabId = null) => {
  return new Promise((resolve, reject) => {
    if (tabId) {
      chrome.tabs.sendMessage(tabId, message, (res) => {
        if (!!res && typeof res === 'object' && 'error' in res) {
          reject(new Error(res.message));
        }

        resolve(res);
      });
    } else {
      chrome.runtime.sendMessage(message, (res) => {
        if (!!res && typeof res === 'object' && 'error' in res) {
          reject(new Error(res.message));
        }

        resolve(res);
      });
    }
  });
}

export const subOnMessage = (options) => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (typeof options[request.type] !== 'undefined' ) {
      let retVal = options[request.type](request.message, (res) => {

        if (res instanceof Error){
          sendResponse({
            error: true,
            message: res.message
          });
        }else{
          sendResponse(res);
        }
      });

      if (options[request.type].constructor.name === 'AsyncFunction'){
        retVal = true;
      }

      return retVal;
    }
  });
}
