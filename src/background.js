import {URL} from './constants/url';
import {pubMessage, subOnMessage} from './utils/transport';
import {DEFAULT, ERRORS} from './constants/enums';

//NOTE: queue executed on every sync call even if it below limit
let execQueue = [];

subOnMessage({
  pass_settings: async (message, callback) => {
    execQueue = await checkQueue(execQueue);
    callback(true);
  },

  retrieve_lists: async (_, callback) => {
    try {
      const response = await processMessage({type: 'get_task_lists'});
      callback(response);
      execQueue = await checkQueue(execQueue, 0);
    }catch (e) {
      callback(e);
    }
  },

  retrieve_tasks: async (message, callback) => {
    try {
      const response = await processMessage(
        {type: 'get_tasks', message: {...message}}
      );

      callback(response);

      execQueue = await checkQueue(execQueue, 0);
    }catch (e) {
      callback(e);
    }
  },

  add_task: async (message, callback) => {
    const response = await toQueue(
      {type: 'add_task', message: {...message}}
    );
    callback(response);
  },

  remove_task: async (message, callback) => {
    const response = await toQueue(
      {type: 'remove_task', message: {...message}}
    );
    callback(response);
  },

  complete_task: async (message, callback) => {
    const response = await toQueue(
      {type: 'complete_task', message: {...message}}
    );
    callback(response);
  },

  update_task: async (message, callback) => {
    const response = await toQueue(
      {type: 'update_task', message: {...message}}
    );
    callback(response);
  },
});

const checkQueue = async (queue, limit = DEFAULT.QUEUE_LIMIT) => {
  if (queue.length > limit){
    await processQueue(queue);
    queue = [];
  }

  return queue;
}

const processQueue = async (queue) => {
  const tabId = await initConnection();
  await Promise.all(queue.map(f => f(tabId)));
  closeConnection(tabId)
}

const toQueue = async (message) => {
  const promise = new Promise((resolve) => {
    execQueue.push(async (tabId) => {
      resolve(await processMessage(message, tabId));
    });
  });

  execQueue = await checkQueue(execQueue);

  return promise;
}

const processMessage = async (message, tabId = null) => {
  let close = false;

  if (!tabId){
    tabId = await initConnection();
    close = true;
  }

  const response = await pubMessage(message, tabId);

  if (close) {
    closeConnection(tabId);
  }

  return response;
}

const initConnection = () => {
  return new Promise((resolve, reject) => {
    let tabId = false;

    chrome.tabs.create(
      {url: URL, active: false},
      function (tab) {
        tabId = tab.id;

        chrome.tabs.executeScript(tabId, {
          file: 'contentScript.js',
          runAt: 'document_idle'
        });
    });

    //NOTE: listener to trigger init
    subOnMessage({
      app_init: () => {
        resolve(tabId);
      },

      app_init_failed: () => {
        reject(new Error(ERRORS.INIT_FAILED));
      }
    });
  });
}

const closeConnection = (tabId) => {
  chrome.tabs.remove(tabId);
}
