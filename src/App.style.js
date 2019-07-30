import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html {
    background: ${({theme}) => theme.background};
  }

  html, body, #root, .App{
    height: 100%;
  }

  *{
    font-family: 'Lato', sans-serif;
  }

  .App{
    margin: auto;
    width: 700px;
  }

  ::-webkit-scrollbar {
    display: none;
  }

  .ReactModal__Overlay {
    opacity: 0;
    transition: opacity 200ms ease-in-out;
  }

  .ReactModal__Overlay--after-open{
      opacity: 1;
  }

  .ReactModal__Overlay--before-close{
      opacity: 0;
  }
`;