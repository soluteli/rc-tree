import { TreeNodeType } from './types'

export const treeData: TreeNodeType[] = [
  {
    id: '1',
    children: [
      {
        id: '1-1',
        children: [
          {
            id: '1-1-1'
          },
          {
            id: '1-1-2'
          }
        ]
      },
      {
        id: '1-2-1'
      }
    ] 
  },
  {
    id: '2',
    children: [
      {
        id: '2-1',
        children: [
          {
            id: '2-1-1'
          },
          {
            id: '2-1-2'
          }
        ]
      },
      {
        id: '2-2'
      }
    ]
  },
  {
    id: '3'
  } 
]
