import React from 'react';
import styled from 'styled-components';

const CheckboxContainer = styled.div`
  display: inline-block;
  border: 2px solid black;
  width: 18px;
  height: 18px;
  &:hover{
    cursor: pointer;
  }
`;

const POLYLINE_STLYES = { fill: 'none', stroke: 'black', strokeWidth: 25 };

const Checkbox = (props) => (
      <CheckboxContainer onClick={() => props.onClick && props.onClick()}>
        {
          props.isChecked &&
          <svg  width="100%" height="100%" viewBox="0 0 200 200">
            <polyline points="25.1,101 76.9,154 177,45.9" style={POLYLINE_STLYES}/>
          </svg>
        }
      </CheckboxContainer>
)

export default Checkbox;