import { createContext } from 'react'

import { TreeNodeType } from '../types'

export interface contextType {
  data?: TreeNodeType[],
  setTreeData?: (v: TreeNodeType[]) => void
}

const Context = createContext<contextType>({})

export default Context