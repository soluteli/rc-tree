import React, { useState } from 'react'

import TreeNode from './tree-node'
import Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

import { ITreeProps } from '../types'

import Context from './context'

function Tree (props: ITreeProps) {
  const [treeData, setTreeData] = useState(props.data)
  return (
    <Context.Provider 
      value={{
        data: treeData,
        setTreeData
      }}
    >
      <DndProvider backend={Backend}>
        <div className="tree-container">
          <Context.Consumer>
              {
                (value) => value.data &&
                  value.data.map((node) => {
                    console.log('node', node)
                    return <TreeNode key={node.id} data={node} />
                  })
              }
          </Context.Consumer>
        </div>
      </DndProvider>
    </Context.Provider>
  )
}


export default Tree
