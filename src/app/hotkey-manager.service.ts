import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HotkeyManagerService {
  public hotkeyRegistry: Map<string, string> = new Map();

  constructor(private eventManager: EventManager, @Inject(DOCUMENT) private document: Document) {
    // set registry for impermanent hotkeys
    this.hotkeyRegistry.set('ctrl.click', 'select page');
    this.hotkeyRegistry.set('shift.click', 'select until item');
    this.hotkeyRegistry.set('enter', 'submit');
  }

  public addShortcut(
    keys: string,
    label: string,
    ignoreInput: boolean = true,
    allowRepeats: boolean = false,
  ) {
    const keyEvent = `keydown.${keys}`;
    this.hotkeyRegistry.set(keys, label);
    return new Observable<KeyboardEvent>((observer) => {
      const handler = (event: KeyboardEvent) => {
        const eventTarget: any = event?.target;
        if ((allowRepeats || !event.repeat) && (!ignoreInput || !(eventTarget.type === 'text'))) {
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
