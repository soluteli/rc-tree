import React, { useState } from 'react'
import update from 'immutability-helper'

import TreeNode from './tree-node'
import Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

import { ITreeProps } from '../types'

import Context from './context'

function Tree (props: ITreeProps) {
  return (
    <Context.Provider 
      value={{
        data: props.data
      }}
    >
      <DndProvider backend={Backend}>
        <div className="tree-container">
          {
            props.data.map((node) => {
              return <TreeNode key={node.id} data={node} />
            })
          }
        </div>
      </DndProvider>
    </Context.Provider>
  )
}


export default Tree
