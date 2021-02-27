import type Item from '../Item';

/**
 * Groups individual items and merges them to a kind of top level summary item.
 */
export default abstract class ItemMerger {
  constructor(public groupKey: string) {}
  abstract merge(items: Item[]): Item;
}
