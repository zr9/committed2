import LocalStorage from './local-storage';
import ChromeStorage from './chrome-storage';

/* global chrome */

class Storage {
    constructor(options) {
        //singleton
        if (!!Storage.instance) return Storage.instance;
        Storage.instance = this;

        //actual constructor logic
        if (!options) throw new Error('options is not passed to Storage constructor');

        const { localStorage, chromeStorage } = options;

        if (localStorage) {
            this.storage = new LocalStorage(localStorage);
        } else if (chromeStorage) {
            this.storage = new ChromeStorage(chromeStorage);
        };
    }

    async get(keys) {
        return await this.storage.get(...keys);
    }

    async set(obj) {
        return await this.storage.set(obj);
    }
}

const storage = new Storage(
    // { chromeStorage: chrome.storage }
    { localStorage: localStorage }
);

export default storage;