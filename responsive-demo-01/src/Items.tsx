import { ReactElement, ReactNode } from "react"

interface ItemsProps {
  elements?: ReactNode[] | ReactElement[];
  splitIndex?: number
  handeSetItemWidth: (index: number) => (ele: any) => void
  handeSetFoldItemWidth: (ele: any) => void
}

const Items = (props: ItemsProps) => {


  const {
    elements,
    splitIndex = props.elements?.length,
    handeSetItemWidth,
    handeSetFoldItemWidth
  } = props

  console.log(elements, 'elements')

  const unfoldElements = elements?.slice(0, splitIndex)
  const foldElements = elements?.slice(splitIndex)

  return (
    <>
      {
        unfoldElements?.map((item, index) => {
          return <div className="col-item" ref={handeSetItemWidth(index)} key={index}>
            {item}
          </div>
        })
      }
      {
        foldElements && foldElements?.length > 0 && (
          <div className="more-item" ref={handeSetFoldItemWidth} key="last">
            +{foldElements.length}
          </div>
        )
      }
    </>
  )
}

export default Items