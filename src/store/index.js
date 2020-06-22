/* global chrome */

import React, { Component, createContext } from 'react';
import StorageFactory from '../utils/storage';
import {DEFAULT, FILTER_OPTIONS, MESSAGES, ORIGIN, STORAGE, TIMEOUT, VERSION} from '../constants/enums';
import THEMES from '../constants/themes';
import {pubMessage} from '../utils/transport';

export const StoreContext = createContext();

const DEFAULT_TODO_STATE = {
  todos: {},
  lists: {},
  listOrder: [],
  todoBeingEdited: null,
};

export class StoreProvider extends Component {
  state = {
    //Todos
    ...DEFAULT_TODO_STATE,
    //App settings
    themeIndex: 0,
    sidebarOpen: false,
    calendarModalOpen: false,
    clockSettings: {
      showDayOfWeek: true,
      showTime: true,
      showDate: true,
      show24HourClock: true,
      showDayBeforeMonth: false,
      customQuote: null
    },
    todoSettings: {
      hideCompleted: false,
      filterByDuedate: FILTER_OPTIONS.SHOW_ALL
    },
    originListData: null,
    originInList: null,
    originOutList: null,
    originSyncTimer: null,
    originLastSyncTime: null,

    storage: STORAGE.LOCAL,
    origin: ORIGIN.LOCAL,
    version: VERSION.EXTENDED,

    lastState: {}
  }

  //helpers
  uncheckRecurringTodos() {
    const { todos } = this.state;

    for (let todoId in todos) {
      const todo = todos[todoId];

      const isRecurring = todo.daysOfWeek.includes(true)

      const dayCompleted = todo.timeCompleted && (new Date(todo.timeCompleted)).getDate();

      const dayToday = (new Date()).getDate();

      if (todo.completed && isRecurring && (dayCompleted && dayCompleted !== dayToday)) {
        this.todosOperations.setTodoCompleted(todoId, false);
      }
    }
  }

  initializeStorage() {
    // storage is always stored in localStorage
    const storageName = StorageFactory.getStorage(STORAGE.LOCAL).get('storage').storage;
    this.appOperations.setStorage(storageName || STORAGE.CHROME);
  }

  async componentDidMount() {
    this.initializeStorage();

    this.uncheckRecurringTodos();

    setInterval(this.uncheckRecurringTodos.bind(this), 1000);
  }

  appOperations = {
    setTheme: (themeIndex) => {
      this.storage.set({ themeIndex: themeIndex });
    },
    setSidebarOpen: (sidebarOpen) => {
      this.setState({ sidebarOpen });
    },
    setCalendarModalOpen: (calendarModalOpen) => {
      this.setState({ calendarModalOpen });
    },
    setClockSettings: (settingsObj) => {
      //TODO: assert settingsObj doesn't have undefined keys
      const newSettings = { ...this.state.clockSettings, ...settingsObj };
      this.storage.set({ clockSettings: newSettings });
    },
    setTodoSettings: (settingsObj) => {
      //TODO: assert settingsObj doesn't have undefined keys
      const newSettings = { ...this.state.todoSettings, ...settingsObj };
      this.storage.set({ todoSettings: newSettings });
    },
    setVersion: async (version) => {
      const lastState = {...this.state, lastState: {}};
      let listOrder = [];

      if (version === VERSION.SIMPLE){
        if (!lastState.listOrder.includes(DEFAULT.LIST_NAME)){
          this.todosOperations.addList(DEFAULT.LIST_NAME);
        }

        listOrder = [DEFAULT.LIST_NAME];
      }else {
        listOrder = lastState.listOrder;
      }

      this.setState({version, lastState, listOrder});
      this.storage.set({ version, lastState, listOrder });
    },
    setOrigin: async (originName) => {
      this.setState({ origin: originName });
      this.storage.set({ origin: originName });

      if (originName !== ORIGIN.LOCAL){
        if ( this.state.version !== VERSION.SIMPLE ) {
          await this.appOperations.setVersion(VERSION.SIMPLE);
        }

        try {
          const response = await pubMessage({type: 'retrieve_lists'})

          this.setState({originListData: response});

          if (this.state.originInList !== DEFAULT.LIST_NAME){
            await this.appOperations.setOriginSyncTimer();
          }
        } catch (e) {
          await this.appOperations.originRevertToLocal();
        }
      } else {
        clearInterval(this.state.originSyncTimer);
      }
    },
    setOriginInList: async (listName) => {
      this.setState({originInList: listName});
      this.storage.set({ originInList: listName });

      await this.appOperations.originMsSyncList(listName);
    },
    originRevertToLocal: async () => {
      await this.appOperations.setOrigin(ORIGIN.LOCAL)
      alert(MESSAGES.INIT_FAILED);
    },
    setOriginOutList: (listName) => {
      this.setState({originOutList: listName});
      this.storage.set({ originOutList: listName });
    },
    setOriginSyncTimer: async () => {
      clearInterval(this.state.originSyncTimer);

      const now = new Date();
      let originLastSyncTime;

      if (!this.state.originLastSyncTime){
        originLastSyncTime = now;
      }else {
        originLastSyncTime = new Date(this.state.originLastSyncTime);
      }

      const timeDiff = (now - originLastSyncTime);

      if (timeDiff > TIMEOUT.SYNC){
        originLastSyncTime = now;
        await this.appOperations.originMsSyncList(this.state.originInList);
      }

      const originSyncTimer = setTimeout(async () => {
        await this.appOperations.setOriginSyncTimer();
      }, TIMEOUT.SYNC);

      this.setState({originSyncTimer, originLastSyncTime});
      this.storage.set({originSyncTimer, originLastSyncTime});
    },
    setStorage: async (storageName) => {
      if (storageName !== STORAGE.LOCAL && storageName !== STORAGE.CHROME) throw new Error('storage can only be local or chrome, but got:', storageName);
      if (this.storage && storageName === this.state.storage) return;

      // storage is always stored in localStorage
      const localStorage = StorageFactory.getStorage('local');
      localStorage.set({ storage: storageName });

      switch (storageName) {
        case 'local':
          this.storage = localStorage;
          break;
        case 'chrome':
          this.storage = StorageFactory.getStorage('chrome');
          break;
      }

      this.setState({
        ...DEFAULT_TODO_STATE,
        storage: storageName,
        ...await this.storage.get(
          'todos',
          'lists',
          'listOrder',
          'themeIndex',
          'clockSettings',
          'todoSettings',
          'version',
          'origin',
          'originListData',
          'originInList',
          'originOutList',
          'originLastSyncTime'
        )
      });

      this.storage.on('save', (changes) => {
        console.log('changes in store', changes);
        this.setState(changes);
      });

      if (this.state.origin !== ORIGIN.LOCAL){
        await pubMessage({
          type: 'pass_settings',
          message:{
            origin: this.state.origin
          }
        });

        try {
          await this.appOperations.setOriginSyncTimer();
        } catch (e) {
          await this.appOperations.originRevertToLocal();
        }
      }
    },
    /*origin functions*/
    originMsAddTask: (task, list, todoId) => {
      pubMessage({type: 'add_task', message: {list: list, task}});

      //NOTE: in case of ms lists mismatch delete new task only from local
      if (list !== this.state.originInList){
        const todos = JSON.parse(JSON.stringify(this.state.todos));

        todos[todoId].timer = setTimeout(() => {
          this.todosOperations.deleteTodo(todoId);
        }, TIMEOUT.HIDE);

        this.storage.set({ todos });
      }
    },
    originMsTaskCompleted: (task, list, isCompleted) => {
      pubMessage({type: 'complete_task', message: {list: list, task, isCompleted}});
    },
    originMsTaskUpdated: (task, list, newName) => {
      pubMessage({type: 'update_task', message: {list: list, task, newName}});
    },
    originMsRemoveTask: (task, list) => {
      pubMessage({type: 'remove_task', message: {list: list, task}});
    },
    originMsSyncList: async (listName) => {
      const response = await pubMessage({
        type: 'retrieve_tasks', message: {list: listName}
      });

      this.todosOperations.clearList(DEFAULT.LIST_NAME);
      response.map(task => this.todosOperations.addTodo(task,DEFAULT.LIST_NAME));
    }
  }

  todosOperations = {
    addTodo: async (name = '', listId, includeOrigin = false) => {
      if(this.state.version === VERSION.SIMPLE){
        listId = DEFAULT.LIST_NAME;
      }

      const newState = JSON.parse(JSON.stringify(this.state));

      const id = '_' + Math.random().toString(36).substr(2, 9);

      newState.todos[id] = {
        id,
        listId,
        name,
        link: null,
        dueDate: null,
        completed: false,
        daysOfWeek: [false, false, false, false, false, false, false],
        timeCompleted: null
      }

      if (listId && listId in newState.lists) {
        newState.lists[listId].todoIds.push(id);
      } else {
        newState.listOrder.push(id);
      }
      //TODO: not save the whole state (e.g. no need todoBeingEdited)
      await this.storage.set(newState);

      if (includeOrigin) {
        this.appOperations.originMsAddTask(name, this.state.originOutList, id);
      }
    },
    addList: (specialId = false) => {
      const newState = JSON.parse(JSON.stringify(this.state));

      let id = '_' + Math.random().toString(36).substr(2, 9);
      let name = '';

      if (specialId) {
        id = specialId;
        name = specialId;
      }

      let newList = {
        id,
        name: name,
        todoIds: []
      }

      newState.lists[id] = newList;


      newState.listOrder.push(id);

      this.storage.set(newState);
    },
    setTodo: (todoId, newTodoName = '') => {
      const todos = JSON.parse(JSON.stringify(this.state.todos));

      if (!(todoId in todos)) return;

      if (this.state.origin === ORIGIN.MS){
        this.appOperations.originMsTaskUpdated(todos[todoId].name, this.state.originInList, newTodoName.trim());
      }

      todos[todoId].name = newTodoName.trim();

      this.storage.set({ todos });
    },
    setList: (listId, newListName) => {
      const lists = JSON.parse(JSON.stringify(this.state.lists));

      if (!(listId in lists)) return;

      lists[listId].name = newListName;

      this.storage.set({ lists });
    },
    setTodoCompleted: (todoId, completed) => {
      const todos = JSON.parse(JSON.stringify(this.state.todos));

      if (!(todoId in todos)) return;

      if (this.state.origin === ORIGIN.MS){
        this.appOperations.originMsTaskCompleted(todos[todoId].name, this.state.originInList, completed);
      }

      clearTimeout(todos[todoId].timer);

      todos[todoId].completed = completed;
      todos[todoId].timeCompleted = completed ? (new Date()).getTime() : null;

      this.storage.set({ todos });

      //NOTE: timeout for hide, against accidental click
      todos[todoId].timer = setTimeout(() => {
        todos[todoId].hidden = completed;
        this.storage.set({ todos });
      }, TIMEOUT.HIDE);

      this.storage.set({ todos });
    },
    toggleTodoDayOfWeek: (todoId, day) => {
      //TODO: assert day is 0 - 6
      const todos = JSON.parse(JSON.stringify(this.state.todos));

      if (!(todoId in todos)) return;

      todos[todoId].daysOfWeek[day] = !todos[todoId].daysOfWeek[day];

      this.storage.set({ todos });
    },
    deleteTodo: (todoId, deleteFromOrigin = false) => {
      const newState = JSON.parse(JSON.stringify(this.state));
      const { todos, lists, listOrder } = newState;

      if (!(todoId in todos)) return;

      if(deleteFromOrigin){
        this.appOperations.originMsRemoveTask(todos[todoId].name, this.state.originInList);
      }

      delete todos[todoId];

      if (listOrder.includes(todoId)) {
        listOrder.splice(listOrder.indexOf(todoId), 1);
      }

      for (let listId in lists) {
        if (lists[listId].todoIds.includes(todoId)) {
          lists[listId].todoIds.splice(lists[listId].todoIds.indexOf(todoId), 1);
          break;
        }
      }

      this.storage.set(newState);
    },
    clearList: (listId) => {
      const newState = JSON.parse(JSON.stringify(this.state));
      const { todos, lists } = newState;

      if (!(listId in lists)) return;

      lists[listId].todoIds.forEach(todoId => delete todos[todoId]);
      lists[listId].todoIds = [];

      this.storage.set(newState);
    },
    deleteList: (listId) => {
      const newState = JSON.parse(JSON.stringify(this.state));
      const { todos, lists, listOrder } = newState;

      if (!(listId in lists)) return;

      lists[listId].todoIds.forEach(todoId => delete todos[todoId]);

      delete lists[listId];

      if (listOrder.includes(listId)) {
        listOrder.splice(listOrder.indexOf(listId), 1);
      }

      this.storage.set(newState);
    },
    setTodoBeingEdited: (todoId) => {
      this.setState({ todoBeingEdited: todoId });
    },
    setTodoDueDate: (dueDate) => {
      const todos = JSON.parse(JSON.stringify(this.state.todos));
      const { todoBeingEdited } = this.state;

      if (!todoBeingEdited || !(todoBeingEdited in todos)) return;

      todos[todoBeingEdited].dueDate = dueDate ? String(dueDate.getTime()) : null;

      this.storage.set({ todos });
    },
    setTodoLink: (todoId, link) => {
      const todos = JSON.parse(JSON.stringify(this.state.todos));

      if (!(todoId in todos)) return;

      todos[todoId].link = link;

      this.storage.set({ todos });
    },
    reorderItems: (newListOrder, newLists) => {
      const newState = {};
      if (newListOrder) newState.listOrder = newListOrder;
      if (newLists) newState.lists = newLists;
      this.storage.set(newState);
    },
  }

  render() {
    const { showDayOfWeek, showTime, showDate, show24HourClock, showDayBeforeMonth, customQuote } = this.state.clockSettings;
    const { hideCompleted, filterByDuedate } = this.state.todoSettings;

    return (
      <StoreContext.Provider value={{
        theme: THEMES[this.state.themeIndex],
        ...this.state,
        ...this.todosOperations,
        ...this.appOperations,
        clockSettings: {
          showDayOfWeek: {
            label: 'Show day of week',
            value: showDayOfWeek
          },
          showTime: {
            label: 'Show time',
            value: showTime
          },
          showDate: {
            label: 'Show date',
            value: showDate
          },
          show24HourClock: {
            label: 'Show 24-hour clock',
            value: show24HourClock
          },
          showDayBeforeMonth: {
            label: 'Show day before month',
            value: showDayBeforeMonth
          },
          customQuote: {
            label: 'Show custom quote',
            value: customQuote
          }
        },
        todoSettings: {
          hideCompleted: {
            label: 'Hide completed',
            value: hideCompleted
          },
          filterByDuedate: {
            label: 'Filter by Duedate',
            value: filterByDuedate
          }
        }
      }}>
        {this.props.children}
      </StoreContext.Provider>
    )
  }

}

export const withStore = Component => props => (
  <StoreContext.Consumer>
    {storeContext => (
      <Component {...props} {...storeContext} />
    )}
  </StoreContext.Consumer>
);
