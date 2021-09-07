import ResizeObserver from 'rc-resize-observer';
import { debounce } from 'lodash'
import Items from "./Items";
import { ReactElement, ReactNode, useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useCallback } from 'react';

interface IContainerProps {
  elements?: ReactNode[] | ReactElement[];
}

interface ICaculateSplitProps {
  elements?: ReactNode[] | ReactElement[];
  contaierWidth: number
  itemsWidth: number[]
  foldWidth: number
}


const caculateSplit = (props: ICaculateSplitProps) => {
  const { elements, contaierWidth, itemsWidth, foldWidth } = props

  console.log(elements, itemsWidth, 'itemsWidth')

  const elementsLen = elements?.length || 0

  if (!contaierWidth || itemsWidth.length < elementsLen) {
    return elementsLen
  }

  let splitIndex = itemsWidth.length;

  let sumWidth = itemsWidth.reduce((acc: number, curr: number) => {
    acc += curr;
    return acc;
  }, 0)

  if (sumWidth > contaierWidth) {
    sumWidth += foldWidth
  }

  for (let index = splitIndex - 1; index >= 0; index--) {
    const width = itemsWidth[index];
    if (sumWidth > contaierWidth) {
      sumWidth = sumWidth - (width);
      splitIndex = index;
    } else {
      break
    }
  }

  return splitIndex
}

const Container = (props: IContainerProps) => {

  // 容器宽度
  const [contaierWidth, setContaierWidth] = useState<number>(0)
  // 存储所有item宽度
  const itemsRef = useRef<number[]>([])
  // 存储折叠按钮宽度
  const [foldWidth, setFoldWidth] = useState<number>(0)
  // 分割index
  const [splitIndex, setSplitIndex] = useState<number | undefined>(props.elements?.length)
  // elements
  const [elements, setElements] = useState<any>()

  useEffect(() => {
    setElements(props.elements)
    setSplitIndex(props.elements?.length)
  }, [props.elements])


  useEffect(() => {
    const splitIndex = caculateSplit({ elements, contaierWidth, itemsWidth: itemsRef.current, foldWidth })
    setSplitIndex(splitIndex)
  }, [contaierWidth, elements, foldWidth])

  // resize时获取容器宽度
  const handleResize = debounce(({ width }: { width: number }) => {
    setContaierWidth(width)
  }, 100)

  // 设置单个item宽度
  const handeSetItemWidth = useCallback((index: number) => (ele: any) => {
    if (ele) {
      // 有update就更新itemsWidth，应对按钮改变文字内容的情况
      itemsRef.current[index] = ele.clientWidth;
    }
  }, [])

  const handeSetFoldItemWidth = useCallback((ele: any) => {
    if (ele) {
      setFoldWidth(ele.clientWidth)
    }
  }, [])



  return (
    <ResizeObserver onResize={handleResize}>
      <div className="container" >
        <Items
          elements={elements}
          splitIndex={splitIndex}
          handeSetItemWidth={handeSetItemWidth}
          handeSetFoldItemWidth={handeSetFoldItemWidth} />
      </div>
    </ResizeObserver>

  );
}

export default Container;
