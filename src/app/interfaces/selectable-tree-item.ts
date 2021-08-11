import { Selectable } from './selectable';

export interface SelectableTreeItem extends Selectable {
  parent?: number;
}
