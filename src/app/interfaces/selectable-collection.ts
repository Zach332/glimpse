import { Selectable } from './selectable';

export class SelectableCollection<Type extends Selectable> implements Iterable<Type> {
  private _collection: Type[] = [];

  private lastToggled = -1;

  private lastShifted = -1;

  constructor(elements?: Type[]) {
    if (elements) {
      this.collection = elements;
    }
  }

  public get collection(): Type[] {
    return this._collection;
  }

  public get length() {
    return this.collection.length;
  }

  public set collection(newCollection: Type[]) {
    this._collection = newCollection;
  }

  public copy() {
    const copy = new SelectableCollection(this.collection);
    copy.lastToggled = this.lastToggled;
    copy.lastShifted = this.lastShifted;
    return copy;
  }

  public getSelectedItems() {
    return this._collection.filter((selectable) => selectable.isSelected);
  }

  public getDeselectedItems() {
    return this._collection.filter((selectable) => !selectable.isSelected);
  }

  public getById(id: string): Type | undefined {
    return this.collection.find((element) => element.id === id);
  }

  public get(index: number) {
    return this.collection[index];
  }

  public getIndexById(id: string): number {
    return this.collection.findIndex((element) => element.id === id);
  }

  public toggleId(id: string): void {
    this.lastShifted = -1;
    const selectedindex = this.getIndexById(id);
    if (selectedindex !== -1) {
      this.lastToggled = selectedindex;
      const selectedElement = this.collection[selectedindex];
      if (selectedElement) {
        selectedElement.isSelected = !selectedElement.isSelected;
      }
    }
  }

  public selectToId(id: string): void {
    if (this.lastShifted !== -1) {
      const collectionRange =
        this.lastShifted < this.lastToggled
          ? this.collection.slice(this.lastShifted, this.lastToggled)
          : this.collection.slice(this.lastToggled + 1, this.lastShifted + 1);
      collectionRange.forEach((element) => {
        element.isSelected = !element.isSelected;
      });
    }
    const endIndex = this.getIndexById(id);
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

  public remove(id: string): void {
    const index = this.getIndexById(id);
    if (index > -1) {
      this.collection.splice(index, 1);
    }
  }

  public insertBeforeId(newElement: Type, id: string) {
    const idIndex = this.getIndexById(id);
    this.collection.splice(idIndex, 0, newElement);
  }

  public getNumSelected(): number {
    return this.collection.reduce(
      (counter, element) => (element.isSelected ? (counter += 1) : counter),
      0,
    );
  }

  public areAllSelected(): boolean {
    return this.collection.every((element) => element.isSelected);
  }

  public areAnySelected(): boolean {
    return this.collection.some((element) => element.isSelected);
  }

  public selectAll(): void {
    this.collection.forEach((element) => (element.isSelected = true));
  }

  public deselectAll(): void {
    this.collection.forEach((element) => (element.isSelected = false));
  }

  public adjustCollection(newData: Type[]) {
    newData.forEach((element) => {
      const existingElement = this.collection.find(
        (currentElement) => currentElement.id === element.id,
      );
      if (existingElement) {
        element.isSelected = existingElement.isSelected;
      }
    });
    this.collection = newData;
  }

  public adjustCollectionMerge(newData: Type[], mergeTo: (initial: Type, merge: Type) => Type) {
    for (let i = 0; i < newData.length; i += 1) {
      const element = newData[i];
      const existingElement = this.collection.findIndex(
        (currentElement) => currentElement.id === element.id,
      );
      if (existingElement !== -1) {
        this.collection.splice(i, 0, mergeTo(this.collection[existingElement], element));
        this.collection.splice(existingElement + 1, 1);
      } else {
        this.collection.splice(i, 0, element);
      }
    }
    this.collection.splice(newData.length, this.collection.length - newData.length);
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
