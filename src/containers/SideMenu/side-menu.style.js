import styled from 'styled-components';

export const SideMenuWrapper = styled.div`
    width: 210px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    background: white;
    min-height:100%;
    height:auto;
`;

export const Header = styled.div`
    & .extension-name {
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 18px;
    }
    & .extension-version {
        color: lightgray;
        font-size: 15px;
    }
`;

export const MenuLabel = styled.div`
    font-size: 16px;
    margin: 10px 0;
    border-top
`;

export const MenuItem = styled.div`
    font-size: 14px;
    margin-bottom: 8px;
`;

export const CheckboxGroup = styled.div`
    margin-bottom: 8px;
`;

export const ThemesWrapper = styled.div`
    column-count: 3;
    margin: 0 auto;
`;

export const ThemeIcon = styled.div`
    background: ${({theme}) => theme.background};
    color: ${({theme}) => theme.primary};
    border: ${({theme}) => theme.secondary};
    border-width: 2px;
    border-style: solid;
    height: 24px;
    width: 24px;
    margin: 5px 10px;
    display: inline-block;
    text-align: center;
    line-height: 24px;
    &:hover {
        cursor: pointer;
    }
`;

export const CustomQuoteInput = styled.input`
    box-sizing: border-box;
    width: 100%;
    height: 20px;
    margin-top: 6px;
    border: lightgray solid 1px;
    border-radius: 4px;
    padding: 5px;
    color: gray;
    &:focus {
        color: black;
    }
    &:disabled {
        background: lightgray;
        cursor: not-allowed;
    }
`;

export const Select = styled.select`
    width: 100%;
`;
