import { useState, useEffect } from "react"
import Container from "./Container"

function createData(count: number): any[] {
  const data: any[] = new Array(count).fill(undefined).map((_, index) => ({
    value: index,
    label: `Label ${index}`,
  }));

  return data;
}

const Demo = () => {

  const [data, setData] = useState<string[]>(createData(200))


  const elements = data.map((item: any) => {
    return <div className="item">{item.label}</div>
  })





  return (
    <div className="demo">
      nusi
      <Container elements={elements} />
    </div>
  )
}

export default Demo