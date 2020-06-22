import {pubMessage, subOnMessage} from './utils/transport';
import {DEFAULT, ERRORS, TIMEOUT} from './constants/enums';

const SELECTORS = {
  APP_LOADED: '#notifications',
  TASK_LIST: '.sidebar li .todayToolbar-title, .sidebar li .listItem-title',
  TASKS_HEADER: 'h2.listTitle',
  TASKS: '#main .taskItem:not(.completed) .taskItem-title',
  TASKS_COMPLETED: '#main .taskItem.completed .taskItem-title',
  ADD_TASK_INPUT: '#main .baseAdd-input',
  ADD_TASK_BUTTON: '#main .baseAdd-button',
  DELETE_TASK_BUTTON: '.rightColumn .detailFooter-trash',
  DELETE_CONFIRM_BUTTON: '.ms-Layer .modal-footer .button.red',
  TASK_CONTAINER: '.taskItem-body',
  TASK_CHECKBOX: '.checkBox',
  TASK_UPDATE_BUTTON: '.editableContent-display',
  TASK_UPDATE_INPUT: '.editableContent-edit textarea',
  LOGIN_REQUIRED: '.mectrl_profilepic',
}

//aliases
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

let appInitFailed = false;

subOnMessage({
  get_task_lists: async (message, callback) => {
    callback(await getTaskList());
  },

  get_tasks: async (message, callback) => {
    callback(await getTasks(message.list));
  },

  add_task: async (message, callback) => {
    callback(await createTask(message.task, message.list));
  },

  remove_task: async (message, callback) => {
    callback(await removeTask(message.task, message.list));
  },

  complete_task: async (message, callback) => {
    callback(await completeTask(message.task, message.list, message.isCompleted));
  },

  update_task: async (message, callback) => {
    callback(await updateTask(message.task, message.list, message.newName));
  },
});

const elementAccessible = (conditionFunction) => {
  const loop = (resolve, reject) => {
    const condition = conditionFunction()

    if(condition){
      resolve(condition);
    }else{
      if (appInitFailed){
        reject(new Error(ERRORS.INIT_FAILED));
      }

      //NOTE: to detect when element is rendered
      //      even after element is resolved data render not immediate
      setTimeout(_ => loop(resolve, reject), TIMEOUT.AWAIT_INTERVAL)
    }
  }

  return new Promise(loop);
}

const elementExist = (selector) => {
  return () => {
    if (null !== $(selector)){
      return $(selector);
    }

    return false;
  }
}

const init = () => {
  pubMessage({type: 'app_init'});
}

const initFailed = () => {
  pubMessage({type: 'app_init_failed'});
}

const getTaskList = () => {
  let taskList = getLists().map(l => l.textContent)
  taskList.unshift(DEFAULT.ORIGIN_NOT_SELECTED);

  return taskList;
}

const getTasks = async (list) => {
  await openList(list);

  return [...$$(SELECTORS.TASKS)].map(l => l.textContent);
}

const getLists = async () => {
  await elementAccessible(elementExist(SELECTORS.TASK_LIST));

  return [...$$(SELECTORS.TASK_LIST)];
}
const openList = async (list) => {
  let listItem = await getLists();
  listItem = listItem.filter(l => l.textContent.trim() === list.trim())[0];

  listItem.click();

  await elementAccessible(() => {
    return $(SELECTORS.TASKS_HEADER).textContent.trim() === list.trim();
  });
}

const openTask = async (task, list) => {
  await openList(list);

  await elementAccessible(() => {
    return $(SELECTORS.TASKS_HEADER).textContent.trim() === list.trim();
  });

  let taskItem = [
    ...$$(SELECTORS.TASKS)
  ].filter(l => l.textContent.trim() === task.trim())[0];

  taskItem.click();
}

const createTask = async (task, list) => {
  await openList(list);

  const input =await elementAccessible(elementExist(SELECTORS.ADD_TASK_INPUT));

  const changeEvent = new Event('change', { bubbles: true });

  input.value = task;
  input.dispatchEvent(changeEvent);

  const button = await elementAccessible(elementExist(SELECTORS.ADD_TASK_BUTTON));
  button.click();

  return true;
}

const removeTask = async (task, list) => {
  await openTask(task, list);

  const button = await elementAccessible(elementExist(SELECTORS.DELETE_TASK_BUTTON));
  button.click();
  $(SELECTORS.DELETE_CONFIRM_BUTTON).click();
}

const completeTask = async (task, list, isCompleted) => {
  let taskSelector;
  await openList(list);

  await elementAccessible(() => {
    return $(SELECTORS.TASKS_HEADER).textContent.trim() === list.trim();
  });

  if (isCompleted){
    taskSelector = SELECTORS.TASKS;
  }else{
    taskSelector = SELECTORS.TASKS_COMPLETED;
  }

  let taskItem = [
    ...$$(taskSelector)
  ].filter(l => l.textContent.trim() === task.trim())[0];

  taskItem.closest(SELECTORS.TASK_CONTAINER).querySelector(SELECTORS.TASK_CHECKBOX).click();
}

const updateTask = async (task, list, newName) => {
  await openTask(task, list);

  const changeEvent = new Event('input', { bubbles: true });
  const blurEvent = new Event('blur', { bubbles: true });

  const button = await elementAccessible(elementExist(SELECTORS.TASK_UPDATE_BUTTON));
  button.click();

  const el = $(SELECTORS.TASK_UPDATE_INPUT);
  el.value = newName;
  el.dispatchEvent(changeEvent);
  el.dispatchEvent(blurEvent);
}

const preInit = async () => {
  //NOTE: check for logged
  const appInitTimer = setTimeout(() => {
    if (null !== $(SELECTORS.LOGIN_REQUIRED)){
      appInitFailed = true;
    }
  }, TIMEOUT.INIT_FAILED);

  await elementAccessible(elementExist(SELECTORS.APP_LOADED))
    .then(init)
    .catch(initFailed);

  clearTimeout(appInitTimer);
}

preInit();
