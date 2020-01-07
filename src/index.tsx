import React, { Component } from 'react';
import { render } from 'react-dom';
import Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

import Tree from './tree/index'

import {treeData} from './data'

interface AppProps { }
interface AppState {
  name: string;
}

class App extends Component<AppProps, AppState> {

  render() {
    return (
      <div>
        <p>
          Start editing to see some magic happen :)
        </p>
        <hr/>
        <Tree data={treeData} />
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
