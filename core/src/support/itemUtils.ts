import ItemMerger from './ItemMerger';
import Item from '../Item';
import ItemGroup from './ItemGroup';
import Page from './Page';

type KeyExtractor = (item: Item) => any;
type PageItemTransformer = (page: number, items: Item[]) => Item[];
type LineItemTransformer = (page: number, line: number, items: Item[]) => Item[];

function groupBy(items: Item[], extractKey: KeyExtractor): Item[][] {
  return items.reduce((pageItems: Item[][], item: Item) => {
    const lastPageItems = pageItems[pageItems.length - 1];
    if (!lastPageItems || extractKey(item) !== extractKey(lastPageItems[0])) {
      pageItems.push([item]);
    } else {
      lastPageItems.push(item);
    }
    return pageItems;
  }, []);
}

export function groupByPage(items: Item[]): Item[][] {
  return groupBy(items, (item) => item.page);
}

export function groupByElement(items: Item[], elementName: string): Item[][] {
  return groupBy(items, (item) => item.data[elementName]);
}

export function transformGroupedByPage(items: Item[], groupedTransformer: PageItemTransformer): Item[] {
  return new Array<Item>().concat(
    ...groupByPage(items).map((pageItems) => groupedTransformer(pageItems[0].page, pageItems)),
  );
}

export function transformGroupedByPageAndLine(items: Item[], groupedTransformer: LineItemTransformer): Item[] {
  let transformedItems: Item[] = [];
  groupByPage(items).forEach((pageItems) => {
    groupByElement(pageItems, 'line').forEach((lineItems) => {
      transformedItems.push(...groupedTransformer(pageItems[0].page, lineItems[0].data['line'], lineItems));
    });
  });
  return transformedItems;
}

export function asPages(items: Item[], itemMerger?: ItemMerger): Page[] {
  return groupByPage(items).map((pageItems: Item[]) => {
    let itemGroups: ItemGroup[];
    if (itemMerger) {
      itemGroups = groupByElement(pageItems, itemMerger.groupKey).map((groupItems) => {
        if (groupItems.length > 1) {
          const top = itemMerger.merge(groupItems);
          return new ItemGroup(top, groupItems);
        } else {
          return new ItemGroup(groupItems[0]);
        }
      });
    } else {
      itemGroups = pageItems.map((item) => new ItemGroup(item));
    }
    return { index: pageItems[0].page, itemGroups } as Page;
  });
}
