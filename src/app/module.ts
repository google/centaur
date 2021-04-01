/**
 * Copyright 2021 Google LLC
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
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {HttpClientModule} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule, Routes} from '@angular/router';

import {MenuPage} from '../pages/menu/component';
import {MenuPageModule} from '../pages/menu/module';

import {DevPage} from '../pages/dev/component';
import {DevPageModule} from '../pages/dev/module';

import {MagicWordPage} from '../pages/magicword/component';
import {MagicWordPageModule} from '../pages/magicword/module';

import {SayItAgainPage} from '../pages/sayitagain/component';
import {SayItAgainPageModule} from '../pages/sayitagain/module';

import {StorySpinePage} from '../pages/storyspine/component';
import {StorySpinePageModule} from '../pages/storyspine/module';

import {CharMakerPage} from '../pages/charmaker/component';
import {CharMakerPageModule} from '../pages/charmaker/module';

import {ImprovPage} from '../pages/improv/component';
import {ImprovPageModule} from '../pages/improv/module';

import {TextGenerationService} from '../services/interfaces';
import {OpenAIGenerationService} from '../services/openai_generation_service';

import {MainApp} from './app';

const routes:

Routes = [
    {path: '', component: MenuPage},
    {path: 'dev', component: DevPage},
    {path: 'magicword', component: MagicWordPage},
    {path: 'sayitagain', component: SayItAgainPage},
    {path: 'storyspine', component: StorySpinePage},
    {path: 'charmaker', component: CharMakerPage},
    {path: 'improv', component: ImprovPage},
];

@NgModule({
    declarations: [
        MainApp,
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule, CommonModule, FormsModule, RouterModule.forRoot(routes),
        MenuPageModule,
        // Import HttpClient Module after Browser Module
        HttpClientModule,
        MatSnackBarModule,
        DevPageModule,
        MagicWordPageModule,
        SayItAgainPageModule,
        StorySpinePageModule,
        CharMakerPageModule,
        ImprovPageModule,
    ],
    exports: [],
    providers: [
        {provide: TextGenerationService, useClass: OpenAIGenerationService},
    ],
    bootstrap: [MainApp],
})
export class AppModule {
}
