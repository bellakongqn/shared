import React from 'react';
import Overflow from './components/index';
import './App.css';
import { useEffect } from 'react';

interface ItemType {
  value: string | number;
  label: string;
}

function createData(count: number): ItemType[] {
  const data: ItemType[] = new Array(count).fill(undefined).map((_, index) => ({
    value: index,
    label: `Label ${index}`,
  }));

  return data;
}

function renderItem(item: ItemType) {
  return (
    // @ts-ignore
    <div
      style={{
        margin: '0 16px 0 8px',
        padding: '4px 8px',
        background: 'rgba(255, 0, 0, 0.2)',
      }}
    >
      {item.label}
    </div>
  );
}

function renderRest(items: ItemType[]) {
  return (
    <div
      style={{
        margin: '0 16px 0 8px',
        padding: '4px 8px',
        background: 'rgba(255, 0, 0, 0.2)',
      }}
    >
      +{items.length}...
    </div>
  );
}

const Demo = () => {
  const [responsive, setResponsive] = React.useState(true);
  const [data, setData] = React.useState(createData(200));


  return (
    <div style={{ padding: 32 }}>
      <button
        type="button"
        onClick={() => {
          setResponsive(!responsive);
        }}
      >
        {responsive ? 'Responsive' : 'MaxCount: 6'}
      </button>


      <div
        style={{
          border: '5px solid green',
          padding: 8,
          maxWidth: 300,
          marginTop: 32,
        }}
      >
        <Overflow<ItemType>
          data={data}
          renderItem={renderItem}
          renderRest={renderRest}
          maxCount={responsive ? 'responsive' : 6}
        />
      </div>
    </div>
  );
};

export default Demo;