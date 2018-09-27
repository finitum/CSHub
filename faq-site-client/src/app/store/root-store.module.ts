import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StoreModule} from '@ngrx/store';

import {TestStoreModule} from '@csedelft/faq/store/test';

@NgModule({
    imports: [
        CommonModule,
        TestStoreModule,
        StoreModule.forRoot({})
    ],
    declarations: []
})
export class RootStoreModule {
}
