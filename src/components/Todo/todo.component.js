// external dependencies
import React, { Component } from 'react';
import { Collapse } from 'react-collapse';
import { Draggable } from 'react-beautiful-dnd';
// components
import { ArrowIcon, CalendarIcon, DeleteIcon, EditIcon } from '../Icons';
import { Checkbox, DaySelector, AddLinkButton, LinkButton } from './subcomponents';
// styled components
import { Body, CheckboxWrapper, TodoWrapper, TodoText, TodoInput, DuedateWrapper, TodoFooterWrapper, ButtonsWrapper, ArrowIconWrapper } from './todo.style';
// store
import { withStore } from '../../store';
import {VERSION} from '../../constants/enums';

// helper functions
function formatDate(msSince1970) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(parseInt(msSince1970, 10));
  return date.getDate() + ' ' + months[date.getMonth()];
}

class Todo extends Component {
  state = {
    isEditing: false,
    isExpanded: false,
    showArrowIcon: false,
    showEditIcon: false,
    todoInputValue: '',
  }

  toggleOpen() {
    this.setState(({ isExpanded }) => ({
      isExpanded: !isExpanded
    }))
  }

  onEditEnd() {
    this.props.setTodo(this.props.id, this.state.todoInputValue);

    if (!this.state.todoInputValue) return;

    this.setState({ isEditing: false, showEditIcon: false });
  }

  renderTodoText() {
    const { id, name, dueDate, theme, link } = this.props;

    return (
      this.props.name === '' || this.state.isEditing ?
        (
          <TodoInput
            autoFocus
            placeholder='New todo name...'
            textColor={theme.primary}
            inputPlaceholderColor={theme.inputPlaceholder}
            value={this.state.todoInputValue}
            onClick={e => e.stopPropagation()}
            onChange={e => { this.setState({ todoInputValue: e.target.value }) }}
            onFocus={() => this.setState({ todoInputValue: name })}
            onBlur={() => this.onEditEnd()}
            onKeyPress={e => { if (e.key === 'Enter') this.onEditEnd(); }}
          />
        ) : (
          <span
            onClick={(e) => {
              e.stopPropagation();
              this.setState({ isEditing: true })
            }}
          >
            <TodoText
              theme={theme}
              onMouseOver={() => { this.setState({ showEditIcon: true }) }}
              onMouseOut={() => { this.setState({ showEditIcon: false }) }}
            >
              {name}
            </TodoText>
            {dueDate ? <DuedateWrapper theme={theme}>({formatDate(dueDate)})</DuedateWrapper> : null}
            {link &&
              <LinkButton
                id={id}
                link={link}
                size={16}
                defaultIconColor={theme.icon.default}
                hoverIconColor={theme.icon.hover}
                tooltipBackgroundColor={theme.tooltip.background}
                tooltipTextColor={theme.tooltip.text}
              />
            }
            {this.state.showEditIcon && <EditIcon theme={theme} />}
          </span>
        )
    );
  }

  render() {
    const {
      id, index, theme,
      completed, setTodoCompleted,
      link, setTodoLink,
      daysOfWeek, toggleTodoDayOfWeek,
      deleteTodo,
      setTodoBeingEdited,
      setCalendarModalOpen,
      version
    } = this.props;

    let versionClass = '';

    if(version === VERSION.SIMPLE){
      versionClass = 'hidden';
    }

    return (
      <Draggable draggableId={id} index={index}>
        {
          (provided) => (
            <div
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              ref={provided.innerRef}
              theme={theme}
            >

              <Body
                onMouseOver={() => { this.setState({ showArrowIcon: true }) }}
                onMouseLeave={() => { this.setState({ showArrowIcon: false }) }}
                onClick={() => { this.toggleOpen() }}
              >
                <CheckboxWrapper>
                  <Checkbox
                    color={theme.primary}
                    isChecked={completed}
                    onClick={(e) => {e.stopPropagation(); setTodoCompleted(id, !completed);}}
                  />
                </CheckboxWrapper>
                <TodoWrapper>
                  {this.renderTodoText()}
                </TodoWrapper>
                  <ArrowIconWrapper>
                    {
                      this.state.showArrowIcon &&
                      <ArrowIcon
                        active={this.state.isExpanded}
                        defaultIconColor={theme.icon.default}
                        hoverIconColor={theme.icon.hover}
                      />
                    }
                  </ArrowIconWrapper>
              </Body>

              <Collapse isOpened={this.state.isExpanded}>
                <TodoFooterWrapper>
                  <DaySelector
                    id={id}
                    className={versionClass}
                    defaultIconColor={theme.icon.default}
                    hoverIconColor={theme.icon.hover}
                    selectedIconColor={theme.icon.selected}
                    daysOfWeek={daysOfWeek}
                    toggleTodoDayOfWeek={toggleTodoDayOfWeek}
                  />
                  <ButtonsWrapper>
                    <AddLinkButton className={versionClass}
                      id={id}
                      link={link}
                      size={16}
                      setTodoLink={setTodoLink}
                      defaultIconColor={theme.icon.default}
                      hoverIconColor={theme.icon.hover}
                      tooltipBackgroundColor={theme.tooltip.background}
                      tooltipPlaceholderColor={theme.tooltip.placeholder}
                      tooltipTextColor={theme.tooltip.text}
                    />
                    <CalendarIcon className={versionClass}
                      defaultIconColor={theme.icon.default}
                      hoverIconColor={theme.icon.hover}
                      onClick={() => { setTodoBeingEdited(id); setCalendarModalOpen(true); }}
                    />
                    <DeleteIcon
                      defaultIconColor={theme.icon.default}
                      hoverIconColor={theme.icon.hover}
                      onClick={() => deleteTodo(id)}
                    />
                  </ButtonsWrapper>
                </TodoFooterWrapper>
              </Collapse>

            </div>
          )
        }
      </Draggable>
    )
  }
}

export default withStore(Todo);
