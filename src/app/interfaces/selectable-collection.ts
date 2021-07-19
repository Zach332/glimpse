import { Selectable } from './selectable';

export class SelectableCollection<Type extends Selectable> implements Iterable<Type> {
  private _collection: Type[] = [];

  private lastToggled = 0;

  private lastShifted = -1;

  public get collection(): Type[] {
    return this._collection;
  }

  public set collection(newCollection: Type[]) {
    this._collection = newCollection;
  }

  public toggleId(id: number): void {
    this.lastShifted = -1;
    const selectedindex = this.collection.findIndex((element) => element.id === id);
    this.lastToggled = selectedindex;
    const selectedElement = this.collection[selectedindex];
    if (selectedElement) {
      selectedElement.isSelected = !selectedElement.isSelected;
    }
  }

  public selectToId(id: number): void {
    if (this.lastShifted !== -1) {
      const collectionRange =
        this.lastShifted < this.lastToggled
          ? this.collection.slice(this.lastShifted, this.lastToggled)
          : this.collection.slice(this.lastToggled + 1, this.lastShifted + 1);
      collectionRange.forEach((element) => {
        element.isSelected = !element.isSelected;
      });
    }
    const endIndex = this.collection.findIndex((element) => element.id === id);
    this.lastShifted = endIndex;
    const collectionRange =
      endIndex < this.lastToggled
        ? this.collection.slice(endIndex, this.lastToggled)
        : this.collection.slice(this.lastToggled + 1, endIndex + 1);
    collectionRange.forEach((element) => {
      element.isSelected = !element.isSelected;
    });
    this.lastShifted = endIndex;
  }

  public push(newElement: Type): void {
    this.collection.push(newElement);
  }

  public getNumSelected(): number {
    return this.collection.reduce(
      (counter, element) => (element.isSelected ? (counter += 1) : counter),
      0,
    );
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
