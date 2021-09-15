import { DataSource } from './data-source';
import { Selectable } from './selectable';

export interface SelectableSidebarButton extends DataSource, Selectable {
  expanded?: boolean;
}
