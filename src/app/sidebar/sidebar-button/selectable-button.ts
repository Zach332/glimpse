import { DataSourceType } from 'src/app/interfaces/data-source-type';
import { SidebarButton } from 'src/app/interfaces/sidebar-button';
import { SidebarManagerService } from '../sidebar-management/sidebar-manager.service';
import { Selectable } from './../../interfaces/selectable';

export class SelectableButton implements SidebarButton, Selectable {
  constructor(readonly id: number, private _label: string, private type: DataSourceType, private sidebarManagerService: SidebarManagerService) {
  }

  public get label(): string {
    return this._label;
  }

  onClick($event: MouseEvent): void {
    if ($event.shiftKey) {
      this.sidebarManagerService.selectToId(this.type, this.id);
    } else {
      this.sidebarManagerService.toggleId(this.type, this.id);
    }
  }
}
