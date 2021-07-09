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
    let pointer = 0;
    return {
      next(): IteratorResult<Type> {
        if (pointer < collection.length) {
          const curPointer = pointer;
          pointer += 1;
          return {
            done: false,
            value: collection[curPointer],
          };
        }
        return {
          done: true,
          value: null,
        };
      },
    };
  }
}
