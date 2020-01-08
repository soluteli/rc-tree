import { TreeNodeType } from '../types'


type pathType = number | string
type dataType = TreeNodeType[]

class TreeMix {
  
  originData: dataType = []

  cache: Map<string, pathType[]> = new Map()

  constructor(data: dataType) {
    this.originData = data

    this.loopSetTreeCache(data)

  }

  loopSetTreeCache (data: dataType, value: pathType[] = []) {
    data.forEach((item, index) => {
      this.cache.set(item.id, [...value, index])
      if (item.children) {
        this.loopSetTreeCache(item.children, [...value, index, 'children'])
      }
    })
  }

  


}

export default TreeMix