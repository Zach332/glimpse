import { Selectable } from './selectable';

export class SelectableCollection<Type extends Selectable> implements Iterable<Type> {
  private _collection: Type[] = [];

  public get collection(): Type[] {
    return this._collection;
  }

  public set collection(newCollection: Type[]) {
    this._collection = newCollection;
  }

  public toggleId(id: string): void {
    const selectedElement = this.collection.find((element) => element.id === id);
    if (selectedElement) {
      selectedElement.isSelected = !selectedElement.isSelected;
    }
  }

  public push(newElement: Type): void {
    this.collection.push(newElement);
  }

  public [Symbol.iterator]() {
    const { collection } = this;
    return {
      next() {
        return {
          done: collection[0] === collection[1],
          value: collection[1],
        };
      },
    };
  }
}
