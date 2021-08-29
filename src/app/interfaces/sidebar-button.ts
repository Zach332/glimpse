import { DataSource } from './data-source';

export interface SidebarButton {
  readonly id: number;
  label: string;
  parentType?: DataSource;
  onClick: ($event: MouseEvent) => void;
}
