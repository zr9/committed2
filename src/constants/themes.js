//TODO: assert theme objects have all requried keys
const THEMES = [
    {
        id: '1',
        primary:'#54545a',
        secondary: 'salmon',
        background: 'white',
        border: '#d8d8d8',
        icon: {
            default: 'lightgray',
            hover: 'gray',
            selected: 'salmon',
        },
        clock: 'lightgray'
    },
    {
        id: '2',
        primary: 'white',
        secondary: '#EAD379', // gold
        background: '#142F43', // royal blue
        border: 'gray',
        icon: {
            default: 'white',
            hover: 'darkgray',
            selected: '#EAD379', // gold
        },
        clock: 'white',
        
    },
    {
        id: '3',
        primary: '#243B6C', // blue
        secondary: 'red',
        background: '#F4F4ED', // grayish
        border: '#DDDDDD',
        icon: {
            default: 'darkgray',
            hover: 'gray',
            selected: 'salmon',
        },
        clock: '#243B6C', // blue
    },
    {
        id: '4',
        primary: 'white',
        secondary: '#287225',
        background: 'linear-gradient(to right, #a8e063, #88B45B)', // green
        border: '#DDDDDD',
        icon: {
            default: 'white',
            hover: '#287225',
            selected: 'black',
        },
        clock: 'white',
    },
    {
        id: '5',
        primary: 'white',
        secondary: 'cyan',
        background: 'linear-gradient(to right, #9733EE, #DA22FF)',
        border: '#DDDDDD',
        icon: {
            default: 'white',
            hover: 'cyan',
            selected: 'black',
        },
        clock: 'white',
    },
    {
        id: '6',
        primary: 'white',
        secondary: '#83ff00',
        background: 'linear-gradient(to right, #fc6767, #ec008c)',
        border: '#DDDDDD',
        icon: {
            default: 'white',
            hover: 'lightgray',
            selected: 'black',
        },
        clock: 'white',
    }
];

export default THEMES;