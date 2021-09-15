import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdGeneratorService {
  // TODO: This component needs to live forever
  private id = 100;

  public getId() {
    this.id += 1;
    return this.id;
  }
}
