import React, { useState, useCallback, useRef, useEffect, useContext } from 'react'
import { useDrag, useDrop, XYCoord } from 'react-dnd'

import { ITreeNodeProps, TreeNodeType } from '../types'

import Context from './context'

type HoverStatus = 'up' | 'middle' | ''

type DragDropType = {
  type: string
  id: string,
  children?: TreeNodeType[]
}

interface IHoverItem {
  type: string,
  id: string
}

type nodePathType = (string | number)[]
type nodeType = null | TreeNodeType

interface IDropNode {
  node: nodeType,
  nodePath: nodePathType
}

function loopGetId(data: TreeNodeType[], ret: string[] = []): string[] {
  data.forEach(item => {
    ret.push(item.id)
    if (item.children) {
      const ids = loopGetId(item.children)
      ret = ret.concat(ids)
    }
  })
  return ret
}

function loopFindChildIDS (data: TreeNodeType[], curId: string, ret: string[] = []): string[] {
  data.forEach(item => {
    if (item.id === curId) {
      if (item.children) {
        // 获取子节点 ID
        const ids = loopGetId(item.children)
        ret = ret.concat(ids)
      }
    } else {
      if (item.children) {
        // 获取子节点 ID
        const ids = loopFindChildIDS(item.children, curId, ret)
        ret = [...ret, ...ids]
      }
    }
  })

  return ret
}

function loopFindNode(data: TreeNodeType[], id: string, dropPath: nodePathType = [], doDelete: boolean = false): IDropNode {
  let node = null
  let nodePath = [...dropPath]
  for (let index = 0; index < data.length; index++) {
    const item = data[index];
    if (item.id === id) {
      node = item
      nodePath = [...dropPath, index]
      doDelete && data.splice(index, 1)
      data = [...data]
      break
    } else {
      if (item.children) {
        const d = loopFindNode(item.children, id, [...dropPath, index, 'children'], true)
        if (d.node) {
          node = d.node
          nodePath = d.nodePath
          break
        }
      }
    }
  }
  return {
    node,
    nodePath
  }
}

function loopFindDropNode(data: TreeNodeType[], id: string, position: HoverStatus, dropPath: nodePathType = [], newNode: nodeType = null) {
  // let node = null
  // let nodePath = [...dropPath]
  if (position === 'up') {
    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      if (item.id === id) {
        // node = data
        // nodePath = [...dropPath]
        if (newNode) {
          data.splice(index, 0, newNode)
          data = [...data]
        }
        break
      } else if (item.children) {
        loopFindDropNode(item.children, id, position, [...dropPath, index, 'children'], newNode)
        // if (d.node) {
        //   node = d.node
        //   nodePath = d.nodePath
        //   break
        // }
      }
    }
  } else if (position === 'middle') {
    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      if (item.id === id) {
        // node = item
        // nodePath = [...dropPath, index]
        if (newNode) {
          if (item.children && item.children.length) {
            item.children.push(newNode)
          } else {
            item.children = [newNode]
          }

          item.children = [...item.children]
        }
        break
      } else {
        if (item.children) {
          loopFindDropNode(item.children, id, position, [...dropPath, index, 'children'], newNode)
          // if (d.node) {
          //   node = d.node
          //   nodePath = d.nodePath
          //   break
          // }
        }
      }
    }
  }
  // return {
  //   node,
  //   nodePath
  // }
}

function moveChild(data: TreeNodeType[], dragId: string, dropId: string, position: HoverStatus) {
  const { node: dragNode } = loopFindNode(data, dragId, [], true)
  loopFindDropNode(data, dropId, position, [], dragNode)
  return [...data]
}


function useDragDrop (props: DragDropType) : [HoverStatus, React.Ref<HTMLDivElement>, boolean, boolean] {
  const ref = useRef<HTMLDivElement>(null)
  const [PreviewStatus, setPreviewStatus] = useState<HoverStatus>('')
  const [isTreeClose, setTreeClose] = useState(true)
  const { data: store, setTreeData } = useContext(Context)

  const [droppedProps, drop] = useDrop({
		accept: ['node', 'nodes'],
    drop: (item, monitor) => {
      const dragId = (item as DragDropType).id
      const dropId = props.id
      if (store) {
        const newData = moveChild(store, dragId, dropId, PreviewStatus)
        console.log('mew',newData)
        setTreeData && setTreeData(newData)
      }
    },
    hover: (item, monitor) => {
      if (!ref.current) {
				return
			}

      if (!props.id) {
        return
      }

      if ((item as IHoverItem).id === props.id) {
        return
      }

      if (!monitor.canDrop()) {
        return
      }

      if (!droppedProps.isOverCurrent) {
        return
      }

      if (props.children && props.children.length && isTreeClose) {
        setTreeClose(false)
      }

      const hoverBoundingRect = ref.current!.getBoundingClientRect()
      const hoverH = hoverBoundingRect.bottom - hoverBoundingRect.top
      // Determine mouse position
			const clientOffset = monitor.getClientOffset()

      if (
        (clientOffset as XYCoord ).x < hoverBoundingRect.left ||
        (clientOffset as XYCoord ).y >= hoverBoundingRect.right - 1
      ) {
        setPreviewStatus('')
        return
      }

      // Get pixels to the top
			const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      if (hoverH * .2 < hoverClientY && hoverClientY < hoverH * .4) {
        setPreviewStatus('up')
      } else if (hoverH * .4 <= hoverClientY && hoverClientY < hoverH * .6) {
        setPreviewStatus('middle')
      } else {
        setPreviewStatus('')
      }
    },
    canDrop: (item, monitor) => {
      const dragId = (item as DragDropType).id

      if (dragId === props.id) {
        return false
      }

      const childIds = store ? loopFindChildIDS(store, dragId) : []
      return !childIds.includes(props.id)
    },
    collect: (monitor) => {
      return {
        isOverCurrent: monitor.isOver({ shallow: true })
      }
    }
	})

  const [, drag] = useDrag({
    item: { type: props.type,  id: props.id },
    collect: (monitor) => {
      return {
        canDrop: monitor.canDrag(), 
        isDragging: monitor.isDragging(),
        getItemType: monitor.getItemType(),
        item: monitor.getItem()
      }
    }
  })
  drag(drop(ref))
  return [PreviewStatus, ref, isTreeClose, droppedProps.isOverCurrent]
}

const TreeNodeContent: React.FC<TreeNodeType> = (props) => {
  return (
    <div
      className="tree-node-content" 
    >      
      { props.id }
    </div>
  )
}

const TreeNode: React.FC<ITreeNodeProps> = (props) => {
  // 
  const [isTreeClose, setTreeClose] = useState(true)

  const handleToggle = useCallback(() => {
    setTreeClose(!isTreeClose)
  }, [setTreeClose, isTreeClose])

  const [status, dragdrop, isHoverTreeClose, isOverCurrent] = useDragDrop({
    type: 'nodes',
    id: props.data.id,
    children: props.data.children
  })

  useEffect(() => {
    setTreeClose(isHoverTreeClose)
  }, [isHoverTreeClose])

  return (
      <div
        className="tree-node"
        style={{
          borderTop: `1px solid ${status === 'up' && isOverCurrent ? 'pink' : 'transparent'}`,
          backgroundColor: `${status === 'middle' && isOverCurrent ? 'pink' : 'transparent'}`
        }}
      >
        <div ref={dragdrop} style={{
          display: 'flex',
        }}>
          {
            props.data.children && props.data.children.length > 0 && 
            <div
              style={{border: '1px solid pink'}}
              onClick={handleToggle}
            >
              {isTreeClose ? '+' : '-'}
            </div>
          }
          <TreeNodeContent
           id={props.data.id} title={props.data.title} />
        </div>
        <div className="tree-node-group" style={{
          paddingLeft: '20px',
          display: isTreeClose ? 'none' : 'block',
        }}>
          {
            props.data.children && props.data.children.length > 0 ?
            props.data.children.map(item => <TreeNode key={item.id} data={item} />)
            :
            null
          }
        </div>
      </div>
    
  )
}


export default TreeNode