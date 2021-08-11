import { SelectableCollection } from './selectable-collection';
import { SelectableTreeItem } from './selectable-tree-item';

export class SelectableTree<Type extends SelectableTreeItem> extends SelectableCollection<Type> {
  public toggleId(id: number): void {
    const selectedElement = super.getById(id);
    if (!selectedElement) {
      return;
    }
    super.toggleId(id);
    if (!selectedElement.parent) {
      if (selectedElement.isSelected) {
        this.collection
          .filter((element) => element.parent === selectedElement.id)
          .forEach((element) => (element.isSelected = true));
      } else {
        this.collection
          .filter((element) => element.parent === selectedElement.id)
          .forEach((element) => (element.isSelected = false));
      }
    } else {
      this.ensureParentConsistency();
    }
  }

  public selectToId(id: number): void {
    super.selectToId(id);
    this.ensureParentConsistency();
  }

  private ensureParentConsistency(): void {
    this.collection
      .filter((element) => !element.parent)
      .forEach((parentElement) => {
        parentElement.isSelected = true;
        this.collection.forEach((collectionElement) => {
          if (!collectionElement.isSelected && collectionElement.parent === parentElement.id) {
            parentElement.isSelected = false;
          }
        });
      });
  }
}
