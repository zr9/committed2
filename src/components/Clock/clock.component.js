import React, { Component } from 'react';
import { TodoInputWrapper } from './clock.style';
import { withStore } from '../../store';
import {DEFAULT, VERSION} from '../../constants/enums';

// helper functions
const convert24HourTo12Hour = timeStr => {
    const [hour, minute, second] = timeStr.split(':');

    if(parseInt(hour) === 0) return `${timeStr} midnight`;

    if(parseInt(hour) < 12) return `${timeStr} a.m.`;

    if(parseInt(hour) === 12 ) return `${timeStr} noon`;

    return `${hour-12}:${minute}:${second} p.m.`;
}

class TodoInput extends Component {

    constructor(props) {
        super(props);
        this.state = {
            timeNow: '',
            newTodoName: '',
        }
        this.updateTimeNow = this.updateTimeNow.bind(this);
        this.renderClockText = this.renderClockText.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    componentDidMount(){
        this.updateTimeNow();
        setInterval(this.updateTimeNow, 1000);
    }

    updateTimeNow(){
        this.setState({ timeNow: String(new Date()) });
    }

    renderClockText(){
        const { customQuote } = this.props.clockSettings;

        if(customQuote.value) return customQuote.value;

        const { showDayOfWeek, showTime, showDate, show24HourClock, showDayBeforeMonth } = this.props.clockSettings;
        const [ dayOfWeek, month, day, year, time ] = this.state.timeNow.split(' ');

        let clockText = '';

        if(showDayOfWeek.value) clockText += `${dayOfWeek} `;
        if(showDate.value) clockText += showDayBeforeMonth.value ? (`${day} ${month} ${year} `) : (`${month} ${day} ${year} `);
        if(showTime.value) clockText += show24HourClock.value ? time : convert24HourTo12Hour(time);

        return clockText;
    }


    handleKeyPress(e){
        if(e.key === 'Enter'){
            const newTodoName = this.state.newTodoName.trim();
            if(newTodoName!==''){
                this.props.addTodo(newTodoName, DEFAULT.LIST_NAME, true);
                this.setState({ newTodoName: '' });
            }
        }
    }

    render(){
        const { theme, version } = this.props;

        return (
            <TodoInputWrapper
                disabled={version === VERSION.EXTENDED}
                value={this.state.newTodoName}
                placeholder={this.renderClockText()}
                theme={this.props.theme}
                onChange={e => {this.setState({newTodoName: e.target.value})}}
                onKeyPress={this.handleKeyPress}
                textColor={theme.clock}
                borderColor={theme.primary}
            />
        )
    }
}

export default withStore(TodoInput);
