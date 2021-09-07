// @ts-nocheck
import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import classNames from 'classnames';
import ResizeObserver from 'rc-resize-observer';
import Item from './Item';
import { useBatchFrameState } from './hooks/useBatchFrameState';

const RESPONSIVE = 'responsive' as const;

export type ComponentType =
  | React.ComponentType<any>
  | React.ForwardRefExoticComponent<any>
  | React.FC<any>
  | keyof React.ReactHTML;

export interface OverflowProps<ItemType> extends React.HTMLAttributes<any> {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  data?: ItemType[];
  itemKey?: React.Key | ((item: ItemType) => React.Key);
  /** Used for `responsive`. It will limit render node to avoid perf issue */
  itemWidth?: number;
  renderItem?: (item: ItemType) => React.ReactNode;
  maxCount?: number | typeof RESPONSIVE;
  renderRest?:
  | React.ReactNode
  | ((omittedItems: ItemType[]) => React.ReactNode);
  component?: ComponentType;
  itemComponent?: ComponentType;
}

function defaultRenderRest<ItemType>(omittedItems: ItemType[]) {
  return `+ ${omittedItems.length} ...`;
}

function Overflow<ItemType = any>(
  props: OverflowProps<ItemType>,
) {
  const {
    prefixCls = 'rc-overflow',
    data = [],
    renderItem,
    renderRawItem,
    itemKey,
    itemWidth = 10,
    style,
    className,
    maxCount,
    renderRest,
    renderRawRest,
    component: Component = 'div',
    itemComponent,
    ...restProps
  } = props;

  // item prefix
  const itemPrefixCls = `${prefixCls}-item`;

  // ❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️
  const createUseState = useBatchFrameState();

  // 容器宽度
  const [containerWidth, setContainerWidth] = createUseState<number>(null);
  const mergedContainerWidth = containerWidth || 0;

  // 所有节点宽度 
  const [itemWidths, setItemWidths] = createUseState(
    new Map<React.Key, number>(),
  );

  // rest Width
  const [prevRestWidth, setPrevRestWidth] = createUseState(0);
  const [restWidth, setRestWidth] = createUseState(0);

  // ❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️
  // Always use the max width to avoid blink
  const mergedRestWidth = Math.max(prevRestWidth, restWidth);

  const [displayCount, setDisplayCount] = useState(null);

  const mergedDisplayCount = React.useMemo(() => {
    return displayCount || 0;
  }, [displayCount]);

  // 是否准备好开始展示
  const [restReady, setRestReady] = useState(false);


  // ================================= Data =================================
  const isResponsive = data.length && maxCount === RESPONSIVE;

  /**
   * When is `responsive`, we will always render rest node to get the real width of it for calculation
   */
  // ❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️
  const showRest =
    isResponsive || (typeof maxCount === 'number' && data.length > maxCount);


  const mergedData = useMemo(() => {
    let items = data;

    if (isResponsive) {
      // ❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️
      items = data.slice(
        0,
        Math.min(data.length, mergedContainerWidth / itemWidth),
      );
    } else if (typeof maxCount === 'number') {
      items = data.slice(0, maxCount);
    }

    return items;
  }, [data, isResponsive, maxCount, mergedContainerWidth, itemWidth]);



  // rest Items
  const omittedItems = useMemo(() => {
    if (isResponsive) {
      return data.slice(mergedDisplayCount + 1);
    }
    return data.slice(mergedData.length);
  }, [data, mergedData, isResponsive, mergedDisplayCount]);

  // ================================= Item =================================
  const getKey = useCallback(
    (item: ItemType, index: number) => {
      if (typeof itemKey === 'function') {
        return itemKey(item);
      }
      return (itemKey && (item as any)?.[itemKey]) ?? index;
    },
    [itemKey],
  );

  const getItemWidth = useCallback((index: number) => {
    return itemWidths.get(getKey(mergedData[index], index));
  }, [getKey, itemWidths, mergedData])

  const mergedRenderItem = useCallback(
    renderItem || ((item: ItemType) => item),
    [renderItem],
  );

  // ================================= Size =================================
  function onOverflowResize(_: object, element: HTMLElement) {
    setContainerWidth(element.clientWidth);
  }

  function registerSize(key: React.Key, width: number | null) {
    setItemWidths(origin => {
      const clone = new Map(origin);

      if (width === null) {
        clone.delete(key);
      } else {
        clone.set(key, width);
      }
      return clone;
    });
  }

  function registerOverflowSize(_: React.Key, width: number | null) {
    setRestWidth(width!);
    setPrevRestWidth(restWidth);
  }

  // ================================ Effect ================================

  const updateDisplayCount = useCallback((count: number, notReady?: boolean) => {
    setDisplayCount(count);
    if (!notReady) {
      // ❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️
      setRestReady(count < data.length - 1);
    }
  }, [data.length])

  React.useLayoutEffect(() => {
    if (mergedContainerWidth && mergedRestWidth && mergedData) {
      let totalWidth = 0;

      const len = mergedData.length;
      const lastIndex = len - 1;

      // When data count change to 0, reset this since not loop will reach
      if (!len) {
        updateDisplayCount(0);
        return;
      }

      for (let i = 0; i < len; i += 1) {
        const currentItemWidth = getItemWidth(i);
        // Break since data not ready
        if (currentItemWidth === undefined) {
          updateDisplayCount(i - 1, true);
          break;
        }

        // Find best match
        totalWidth += currentItemWidth;

        if (
          // Only one means `totalWidth` is the final width
          (lastIndex === 0 && totalWidth <= mergedContainerWidth) ||
          // Last two width will be the final width
          (i === lastIndex - 1 &&
            totalWidth + getItemWidth(lastIndex)! <= mergedContainerWidth)
        ) {
          // Additional check if match the end
          updateDisplayCount(lastIndex);
          break;
        } else if (totalWidth + mergedRestWidth > mergedContainerWidth) {
          // Can not hold all the content to show rest
          updateDisplayCount(i - 1);
          break;
        }
      }

    }
  }, [mergedContainerWidth, itemWidths, restWidth, getKey, mergedData, mergedRestWidth, updateDisplayCount, getItemWidth]);

  // ================================ Render ================================
  const displayRest = restReady && !!omittedItems.length;


  const itemSharedProps = {
    prefixCls: itemPrefixCls,
    responsive: isResponsive,
    component: itemComponent,
  };

  // >>>>> Choice render fun by `renderRawItem`
  const internalRenderItemNode = (item: ItemType, index: number) => {
    const key = getKey(item, index);
    return (
      <Item
        {...itemSharedProps}
        // ❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️
        order={index}
        key={key}
        item={item}
        renderItem={mergedRenderItem}
        itemKey={key}
        registerSize={registerSize}
        display={index <= mergedDisplayCount}
      />
    );
  };

  // >>>>> Rest node
  // let restNode: React.ReactNode;
  const restContextProps = {
    // ❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️
    order: displayRest ? mergedDisplayCount : Number.MAX_SAFE_INTEGER,
    className: `${itemPrefixCls}-rest`,
    registerSize: registerOverflowSize,
    display: displayRest,
  };

  const mergedRenderRest = renderRest || defaultRenderRest;

  const restNode = (
    <Item
      {...itemSharedProps}
      // When not show, order should be the last
      {...restContextProps}
    >
      {typeof mergedRenderRest === 'function'
        ? mergedRenderRest(omittedItems)
        : mergedRenderRest}
    </Item>
  );

  let overflowNode = (
    <Component
      className={classNames(prefixCls, className)}
      style={style}
      // ref={ref}
      {...restProps}
    >
      {mergedData.map(internalRenderItemNode)}

      {/* Rest Count Item */}
      {showRest ? restNode : null}
    </Component>
  );

  if (isResponsive) {
    overflowNode = (
      <ResizeObserver onResize={onOverflowResize}>
        {overflowNode}
      </ResizeObserver>
    );
  }

  return overflowNode;
}

export default Overflow
