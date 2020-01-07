import React, { useState, useCallback, useRef, useEffect, useContext } from 'react'
import { useDrag, useDrop, XYCoord } from 'react-dnd'

import { ITreeNodeProps, TreeNodeType } from '../types'

import Context, { contextType } from './context'

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

function loopFindChildren (data: TreeNodeType[], curId: string, ret: string[] = []): string[] {
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
        const ids = loopFindChildren(item.children, curId, ret)
        ret = [...ret, ...ids]
      }
    }
  })

  return ret
}


function useDragDrop (props: DragDropType) : [HoverStatus, React.Ref<HTMLDivElement>, boolean, boolean] {
  const ref = useRef<HTMLDivElement>(null)
  const [PreviewStatus, setPreviewStatus] = useState<HoverStatus>('')
  const [isTreeClose, setTreeClose] = useState(true)
  const { data: store } = useContext(Context)

  const [droppedProps, drop] = useDrop({
		accept: ['node', 'nodes'],
    drop: (item, monitor) => {
      const dragId = (item as DragDropType).id
      const dropId = props.id
      console.log('cc', monitor.canDrop())
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

      const childIds = store ? loopFindChildren(store, dragId) : []
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
            props.data.children && <div
              style={{border: '1px solid pink'}}
            onClick={handleToggle}>{isTreeClose ? '+' : '-'}  </div>
          }
          <TreeNodeContent
           id={props.data.id} title={props.data.title} />
        </div>
        <div className="tree-node-group" style={{
          paddingLeft: '20px',
          display: isTreeClose ? 'none' : 'block',
        }}>
          {
            props.data.children ?
            props.data.children.map(item => <TreeNode key={item.id} data={item} />)
            :
            null
          }
        </div>
      </div>
    
  )
}


export default TreeNode