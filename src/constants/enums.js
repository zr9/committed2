export const FILTER_OPTIONS = Object.freeze({
    SHOW_ALL: 'Show all',
    DUE_BY_TODAY: 'Show due by today',
    DUE_BY_TOMORROW: 'Show due by tomorrow',
    DUE_IN_A_WEEL: 'Show due in a week',
    DUE_IN_A_MONTH: 'Show due in a month'
});

export const STORAGE = Object.freeze({
    LOCAL: 'local',
    CHROME: 'chrome',
});

export const VERSION = Object.freeze({
    EXTENDED: 'extended',
    SIMPLE: 'simple',
});

export const DEFAULT = Object.freeze({
    LIST_NAME: 'all-todos',
    ORIGIN_NOT_SELECTED: 'Not selected',
    QUEUE_LIMIT: 5,
});

export const ORIGIN = Object.freeze({
    LOCAL: 'local',
    MS: 'ms',
});

export const TIMEOUT = Object.freeze({
    HIDE: 5000,
    AWAIT_INTERVAL: 1000,
    INIT_FAILED: 5000,
    SYNC: 10*60*1000,
});

export const MESSAGES = Object.freeze({
    INIT_FAILED: 'Unable to init, you need to login',
})

export const ERRORS = Object.freeze({
    INIT_FAILED: 'Init failed',
})
