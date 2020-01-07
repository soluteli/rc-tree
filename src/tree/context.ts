import React, { createContext } from 'react'

import { TreeNodeType } from '../types'

export interface contextType {
  data?: TreeNodeType[]
}

const Context = createContext<contextType>({})

export default Context