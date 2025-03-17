import { Injectable } from '@nestjs/common';
import { OS } from './os.enum';

// Import your icon JSON files
import * as iosIcons from './sources/ios.json';
import * as androidIcons from './sources/android.json';
import * as browserIcons from './sources/browser.json';
import { IconKey } from './icon-keys.enum';

@Injectable()
export class IconsService {

  // Private property to hold the current OS; default is ios.
  private currentOS: OS = OS.ios;

  // Preload icons for each OS.
  private iconsMap: Record<OS, Record<string, string>> = {
    [OS.ios]: iosIcons,
    [OS.android]: androidIcons,
    [OS.browser]: browserIcons,
  };

  // Set the current OS (for example, based on the current user session)
  setOS(os: OS): void {
    this.currentOS = os;
  }

  // Get the current OS as a string
  getOS(): string {
    return this.currentOS;
  }

  /**
   * Return the icon for a given key based on the current OS.
   *
   * @param key - The key of the icon to retrieve (could be string or a generated enum type)
   * @returns A promise that resolves with the icon string.
   */
  async getOSIcon(key: IconKey): Promise<string> {
    const icons = this.iconsMap[this.currentOS];
    const icon = icons[key];
    if (!icon) {
      throw new Error(`Icon for key "${key}" not found for OS "${this.currentOS}".`);
    }
    return icon;
  }
}