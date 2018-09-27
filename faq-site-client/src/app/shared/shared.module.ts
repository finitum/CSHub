import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';

import {SharedImportsModule} from './imports/shared-imports.module';
import {SharedDirectivesModule} from './directives/shared-directives.module';
import {SharedPipesModule} from './pipes/shared-pipes.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SharedImportsModule,
        SharedDirectivesModule,
        SharedPipesModule
    ],
    exports: [
        ReactiveFormsModule,
        SharedImportsModule,
        SharedDirectivesModule,
        SharedPipesModule
    ]
})
export class SharedModule {
}
