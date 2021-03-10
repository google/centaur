/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule, Routes} from '@angular/router';

import {MainApp} from './app';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MenuPage} from '../pages/menu/component';
import {MenuPageModule} from '../pages/menu/module';

const routes: Routes = [
  {path: '', pathMatch: 'full', component: MenuPage},
];

@NgModule({
  declarations: [
    MainApp,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    RouterModule.forRoot(routes),
    MenuPageModule
  ],
  exports: [],
  bootstrap: [MainApp],
})
export class AppModule {
}
