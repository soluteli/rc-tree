export type TreeNodeType = {
  id: string
  title?: string
  children?: TreeNodeType[]
}

export interface ITreeProps {
  data: TreeNodeType[]
}

export interface ITreeNodeProps {
  data: TreeNodeType
}




