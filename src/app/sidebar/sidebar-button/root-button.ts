import { DataSourceType } from 'src/app/interfaces/data-source-type';
import { SidebarButton } from 'src/app/interfaces/sidebar-button';
import { SidebarManagerService } from '../sidebar-management/sidebar-manager.service';
import { Selectable } from './../../interfaces/selectable';

export class RootButton implements SidebarButton, Selectable {
  constructor(readonly id: number, private _label: string, private type: DataSourceType, private sidebarManagerService: SidebarManagerService) {
  }

  public get label(): string {
    return this._label;
  }

  public get isSelected(): boolean {
    return this.sidebarManagerService.areAllSelected(this.type);
  }

  onClick(): void {
  }
}
