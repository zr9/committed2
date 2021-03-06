import React, { Component } from 'react';
import THEMES from '../../constants/themes';
import { withStore } from '../../store';
import {
    CheckboxGroup,
    CustomQuoteInput,
    Header,
    MenuItem,
    MenuLabel,
    Select,
    SideMenuWrapper,
    ThemeIcon,
    ThemesWrapper,
} from './side-menu.style';
import Checkbox from './checkbox';
import DevFoxIcon from '../../components/Icons/DevFoxIcon';
import {FILTER_OPTIONS, ORIGIN, STORAGE, VERSION} from '../../constants/enums';
class SideMenu extends Component {
    constructor(props) {
        super(props);
        this.quoteInput = React.createRef();
    }

    componentDidUpdate() {
        const { open, clockSettings } = this.props;
        if (open && clockSettings.customQuote.value) {
            this.quoteInput.current.focus();
        }
    }

    render() {
        const {
            setTheme,
            clockSettings,
            setClockSettings,
            todoSettings,
            setTodoSettings,
            checkboxStyles,
            storage,
            setStorage,
            origin,
            setOrigin,
            originListData,
            originInList,
            originOutList,
            setOriginInList,
            setOriginOutList,
            version,
            setVersion,
        } = this.props;
        const { customQuote, ...checkboxSettings } = clockSettings;
        const { hideCompleted, filterByDuedate } = todoSettings;

        let OriginSettings;

        if (origin === ORIGIN.MS){
          if (originListData ) {
            OriginSettings = (
              <div>
                <MenuLabel>Ms read list</MenuLabel>

                <Select
                  value={originInList}
                  onChange={e => setOriginInList(e.target.value)}
                >
                  {originListData.map(function (listName, i) {
                    return <option key={i} value={listName}>{listName}</option>;
                  })}
                </Select>

                <MenuLabel>Ms write list</MenuLabel>

                <Select
                  value={originOutList}
                  onChange={e => setOriginOutList(e.target.value)}
                >
                  {originListData.map(function (listName, i) {
                    return <option key={i} value={listName}>{listName}</option>;
                  })}
                </Select>
              </div>
            );
          }else{
            OriginSettings = (
              <div>Loading lists</div>
            );
          }
        }else{
          OriginSettings = (
            <div>
              <MenuLabel>Filter Todos</MenuLabel>

              <MenuItem>

                <CheckboxGroup>
                  <label>
                    <Checkbox
                      {...checkboxStyles}
                      checked={hideCompleted.value}
                      onChange={() => setTodoSettings({ hideCompleted: !hideCompleted.value })}
                    />
                    <span style={{ marginLeft: 8 }}>{hideCompleted.label}</span>
                  </label>
                </CheckboxGroup>

                <CheckboxGroup>
                  <Select
                    value={filterByDuedate.value}
                    onChange={e => setTodoSettings({ filterByDuedate: e.target.value })}
                  >
                    {
                      Object.entries(FILTER_OPTIONS).map(([key, value]) => (
                        <option
                          key={key}
                          value={value}
                        >
                          {value}
                        </option>
                      ))
                    }
                  </Select>
                </CheckboxGroup>

              </MenuItem>
            </div>
          );
        }

        return (
            <SideMenuWrapper>

                <Header>
                    <div className="extension-name">committed</div>
                    <div className="extension-version">v3.0.0</div>
                </Header>

                <MenuLabel>Choose Theme</MenuLabel>

                <MenuItem>
                    <ThemesWrapper>
                        {
                            THEMES.map((theme, i) => (
                                <ThemeIcon
                                    key={i}
                                    theme={theme}
                                    onClick={() => setTheme(i)}
                                >C</ThemeIcon>
                            ))
                        }
                    </ThemesWrapper>
                </MenuItem>

                <MenuLabel>Clock Settings</MenuLabel>

                <MenuItem>
                    {
                        Object.entries(checkboxSettings).map(([key, { label, value }]) => (
                            <CheckboxGroup key={key}>
                                <label>
                                    <Checkbox
                                        {...checkboxStyles}
                                        checked={value}
                                        onChange={() => setClockSettings({ [key]: !value })}
                                    />
                                    <span style={{ marginLeft: 8 }}>{label}</span>
                                </label>
                            </CheckboxGroup>
                        ))
                    }
                    <CheckboxGroup>
                        <label>
                            <Checkbox
                                {...checkboxStyles}
                                checked={!!customQuote.value}
                                onChange={() => setClockSettings({ customQuote: !!customQuote.value ? null : 'your quote here...' })}
                            />
                            <span style={{ marginLeft: 8 }}>Show custom quote</span>
                        </label>
                        <CustomQuoteInput
                            ref={this.quoteInput}
                            value={customQuote.value || 'your quote here...'}
                            disabled={!customQuote.value}
                            onChange={e => setClockSettings({ customQuote: e.target.value })}
                        />
                    </CheckboxGroup>
                </MenuItem>

                <MenuLabel>Select Version</MenuLabel>
                <Select
                  value={version}
                  onChange={e => setVersion(e.target.value)}
                >
                  <option value={VERSION.EXTENDED}>
                    Extended - additional lists
                  </option>
                  <option value={VERSION.SIMPLE}>
                    Simple - only one list
                  </option>
                </Select>

                <MenuLabel>Set Origin</MenuLabel>
                <Select
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                >
                  <option value={ORIGIN.LOCAL}>
                    Local - use local storage as origin
                  </option>
                  <option value={ORIGIN.MS}>
                    Ms - use ms todo as origin
                  </option>
                </Select>

                {OriginSettings}

                <MenuLabel>Set Storage</MenuLabel>

                  <CheckboxGroup>
                      <Select
                          value={storage}
                          onChange={e => setStorage(e.target.value)}
                      >
                          <option value={STORAGE.CHROME}>
                              Chrome - data synced to all logged in browsers, but slower
                          </option>
                          <option value={STORAGE.LOCAL}>
                              Local - faster, but only available in this browser
                          </option>
                      </Select>
                  </CheckboxGroup>

                  <DevFoxIcon/>

              </SideMenuWrapper>
        )
    }
}
export default withStore(SideMenu);
