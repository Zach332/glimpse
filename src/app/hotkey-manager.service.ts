import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HotkeyManagerService {
  constructor(private eventManager: EventManager, @Inject(DOCUMENT) private document: Document) {}

  public addShortcut(keys: string, ignoreInput: boolean = true) {
    const keyEvent = `keydown.${keys}`;
    return new Observable<KeyboardEvent>((observer) => {
      const handler = (event: KeyboardEvent) => {
        const eventTarget: any = event?.target;
        if (ignoreInput && !eventTarget.type) {
          event.preventDefault();
          observer.next(event);
        }
      };

      const removeListener = this.eventManager.addEventListener(
        this.document.body,
        keyEvent,
        handler,
      );

      return () => {
        removeListener();
      };
    });
  }
}
