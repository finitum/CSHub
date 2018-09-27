import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StoreModule} from '@ngrx/store';

import {testReducer} from './test.reducer';

@NgModule({
    imports: [
        CommonModule,
        StoreModule.forFeature('test', testReducer)
    ],
    declarations: []
})
export class TestStoreModule {
}
