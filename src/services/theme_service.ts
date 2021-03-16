import {Injectable} from '@angular/core';

export const lightTheme = {
  'background': '#F8F7F8',
  'grey': '#e4e4e4',
  'foreground': 'black',
  'hover': '#cfd8dc',
  'accent': 'dodgerblue',
  'pink': 'deeppink',
};

export const darkTheme = {
  'background': '#101925',
  'grey': '#2C303A',
  'foreground': 'white',
  'hover': 'black',
  'accent': '#3bdecb',
  'pink': 'hotpink',
};

@Injectable({providedIn: 'root'})
export class ThemeService {
  themes = [lightTheme, darkTheme];
  themeIndex = 0;

  cycleTheme() {
    this.themeIndex = (this.themeIndex + 1) % this.themes.length;
    this.setTheme(this.themes[this.themeIndex]);
  }

  private setTheme(theme: {[key: string]: string}) {
    Object.keys(theme).forEach(
        k => document.documentElement.style.setProperty(`--${k}`, theme[k]));
  }
}
