import { Selectable } from './selectable';

export class SelectableCollection<Type extends Selectable> implements Iterable<Type> {
  private _collection: Type[] = [];

  private lastToggled = 0;

  public get collection(): Type[] {
    return this._collection;
  }

  public set collection(newCollection: Type[]) {
    this._collection = newCollection;
  }

  public toggleId(id: number): void {
    const selectedindex = this.collection.findIndex((element) => element.id === id);
    this.lastToggled = selectedindex;
    const selectedElement = this.collection[selectedindex];
    if (selectedElement) {
      selectedElement.isSelected = !selectedElement.isSelected;
    }
  }

  public selectToId(id: number): void {
    const endElement = this.collection.findIndex((element) => element.id === id);
    const collectionRange =
      endElement < this.lastToggled
        ? this.collection.slice(endElement, this.lastToggled)
        : this.collection.slice(this.lastToggled + 1, endElement + 1);
    collectionRange.forEach((element) => {
      element.isSelected = !element.isSelected;
    });
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
