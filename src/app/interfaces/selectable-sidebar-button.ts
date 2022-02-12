import { DataSource } from './data-source';
import { Selectable } from './selectable';

export interface SelectableDataSource extends DataSource, Selectable {
  expanded?: boolean;
}
