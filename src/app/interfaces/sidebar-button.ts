import { DataSourceType } from './data-source-type';

export interface SidebarButton {
  readonly id: number;
  label: string;
  type: DataSourceType;
  expanded?: boolean;
}
