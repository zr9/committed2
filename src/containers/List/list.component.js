import React, { Component } from 'react';
import Todo from '../../components/Todo';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { withContext } from '../../contexts';
import { DeleteIcon, EditIcon, PlusIcon } from '../../components/Icons';
import { ListWrapper, ListNameWrapper, SideMenu, ListHeader, ListInput, ListText } from './list.style';

class List extends Component {
  state = {
    showSideMenu: false,
    showEditIcon: false,
    isEditing: false,
    listInputValue: '',
  }

  componentDidMount() {
    // Autofocus on input if list name is empty (when a new list is created)
    if (this.props.name === '') {
      this.setState({ isEditing: true });
    }
  }

  onEditEnd() {
    this.props.setList(this.props.id, this.state.listInputValue);

    if (!this.state.listInputValue) return;

    this.setState({ isEditing: false, showEditIcon: false });
  }

  renderListName() {
    const { name } = this.props;
    return (
      this.state.isEditing ?
        (
          <ListInput
            autoFocus
            placeholder='New list name...'
            value={this.state.listInputValue}
            onClick={e => e.stopPropagation()}
            onChange={e => { this.setState({ listInputValue: e.target.value }) }}
            onFocus={() => this.setState({ listInputValue: name })}
            onBlur={() => this.onEditEnd()}
            onKeyPress={e => { if (e.key === 'Enter') this.onEditEnd() }}
          />
        ) : (
          <span
            onClick={(e) => {
              e.stopPropagation();
              this.setState({ isEditing: true })
            }}
          >
            <ListText
              onMouseOver={() => { this.setState({ showEditIcon: true }) }}
              onMouseOut={() => { this.setState({ showEditIcon: false }) }}
            >
              {name}
            </ListText>
            {this.state.showEditIcon && <EditIcon size={10} />}
          </span>
        )
    )
  }

  render() {
    const { id, index, todoIds, todos, theme } = this.props;
    return (
      <Draggable draggableId={id} index={index}>
        {
          (provided) => (
            <ListWrapper
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              ref={provided.innerRef}
            >
              <ListHeader
                onMouseEnter={() => this.setState({ showSideMenu: true })}
                onMouseLeave={() => this.setState({ showSideMenu: false })}
              >
                <ListNameWrapper>
                  {this.renderListName()}
                </ListNameWrapper>
                {/* <ProgressWrapper>
                  {todoIds.reduce((acc, cur) => todos[cur].completed ? acc + 1 : acc, 0)}/{todoIds.length}
                </ProgressWrapper> */}
                <SideMenu>
                  {
                    this.state.showSideMenu &&
                    (
                      <React.Fragment>
                        <PlusIcon
                          defaultIconColor={theme.icon.default}
                          hoverIconColor={theme.icon.hover}
                          onClick={() => console.log('add todo')}
                        />
                        <DeleteIcon
                          small
                          defaultIconColor={theme.icon.default}
                          hoverIconColor={theme.icon.hover}
                          onClick={() => console.log('delete list')}
                        />
                      </React.Fragment>
                    )
                  }
                </SideMenu>
              </ListHeader>
              <Droppable droppableId={id} type='todo'>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ minHeight: 30 }}
                  >
                    {
                      todoIds.map((id, index) => (
                        <Todo
                          key={todos[id].id}
                          index={index}
                          {...todos[id]}
                        />
                      ))
                    }
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </ListWrapper>
          )
        }
      </Draggable>
    );
  }
}

export default withContext(List);