import EventEmitter from 'events';

class LocalStorage extends EventEmitter {
    constructor(localStorage = window.localStorage) {
        super();
        if (localStorage == null) throw new Error('localStorage did not get passed into the LocalStorage constructor!')
        this.localStorage = localStorage
    }

    get = (...keys) => {
        return keys && keys.reduce((result, key) => {
            let value = this.localStorage.getItem(key);

            if (!value) return result;

            try {
                value = JSON.parse(value);
            } catch (e) {/*ignore */}

            result[key] = value;

            return result;
        }, {})
    }

    set = (obj) => {
        obj && Object.keys(obj).forEach(key => {
            let value = obj[key];

            if (typeof value === 'object') value = JSON.stringify(value);

            this.localStorage.setItem(key, value);
        });
        
        this.emit('save', obj);

        return 'Value saved!';
    }
}

export default LocalStorage;