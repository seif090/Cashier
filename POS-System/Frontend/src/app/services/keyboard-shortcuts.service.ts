import { Injectable, inject, signal, HostListener } from '@angular/core';
import { KeyboardShortcut } from '../models/advanced.models';

@Injectable({ providedIn: 'root' })
export class KeyboardShortcutsService {
  private shortcuts = signal<KeyboardShortcut[]>([]);

  register(shortcut: KeyboardShortcut): void {
    this.shortcuts.update(current => [...current, shortcut]);
  }

  unregister(key: string): void {
    this.shortcuts.update(current => current.filter(s => s.key !== key));
  }

  clear(): void {
    this.shortcuts.set([]);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const ctrlKey = event.ctrlKey || event.metaKey;
    
    let matchedKey = key;
    if (ctrlKey) {
      matchedKey = `ctrl+${key}`;
    }

    const shortcut = this.shortcuts().find(s => 
      s.key.toLowerCase() === matchedKey || s.key.toLowerCase() === key
    );

    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }

  getShortcuts(): KeyboardShortcut[] {
    return this.shortcuts();
  }
}
