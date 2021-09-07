import { useEffect } from "react"
import ResizeObserver from 'rc-resize-observer';
import { findIndex } from 'lodash'
import { ReactNode, ReactElement, useState } from "react"
import { useCallback } from "react";
import { useRef } from "react";

interface IContainerProps {
  elements?: ReactNode[] | ReactElement[];
}


const Container = (props: IContainerProps) => {
  const [elements, setElements] = useState<any>()
  const listRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)
  const [moreCon, setMoreCount] = useState<number>(0)


  const handleResize = useCallback(() => {
    if (listRef.current) {
      const listConRect: DOMRect = listRef.current?.getBoundingClientRect();
      const more = moreRef.current
      const items = listRef.current.querySelectorAll('.col-item');
      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        // @ts-ignore
        if (listConRect.right < itemRect.right) {
          // @ts-ignore
          return item.style.visibility = 'hidden';
          // @ts-ignore
        } else if (listConRect.right >= itemRect.right) {
          // @ts-ignore
          item.style.visibility = 'visible';
        }
      });

      const latest = findIndex(items, (item) => {
        // @ts-ignore
        return item.style.visibility === 'hidden';
      });

      setMoreCount(items.length - latest)

      if (latest >= 0) {
        const latestItem = items[latest];
        const latestRect = latestItem.getBoundingClientRect();
        // @ts-ignore
        more!.style.left = (latestRect.left - listConRect.right) + 'px';
        // @ts-ignore
        more!.style.visibility = 'visible';
      } else {
        // @ts-ignore
        more!.style.left = '0px';
        // @ts-ignore
        more!.style.visibility = 'hidden';
      }
    }
  }, [])

  useEffect(() => {
    setElements(props.elements)
    setTimeout(() => {
      handleResize()
    });
  }, [handleResize, props.elements])

  return (
    <ResizeObserver onResize={handleResize}>
      <div className="container">
        <div className="center" ref={listRef}>
          {
            elements?.map((item: any, index: number) => {
              return (
                <div className="col-item" key={index}>
                  {item}
                </div>
              )
            })
          }
        </div>
        <div className="more" ref={moreRef}>
          {moreCon}
        </div>
      </div>
    </ResizeObserver>
  )
}

export default Container