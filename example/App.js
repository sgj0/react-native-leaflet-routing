import React from 'react';
import Routing from './Routing';

export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const from = [48.87541, 2.32555];
    const to = [48.85513, 2.38713];

    return (<Routing from={from} to={to}/>);
  }
}
