import { DataSourceType } from 'src/app/interfaces/data-source-type';
import { SidebarButton } from 'src/app/interfaces/sidebar-button';
import { SidebarManagerService } from '../sidebar-management/sidebar-manager.service';
import { Selectable } from './../../interfaces/selectable';

export class NewButton implements SidebarButton, Selectable {
  private _isSelected: boolean;

  constructor(readonly id: number, private _label: string, private type: DataSourceType, private sidebarManagerService: SidebarManagerService) {
    this._isSelected = false;
  }

  public get isSelected(): boolean {
    return this._isSelected;
  }

  public get label(): string {
    return this._label;
  }

  onClick(): void {
    if (this.type === DataSourceType.SavedFolder) {
      this.sidebarManagerService.insertSavedFolder();
    }
  }
}
