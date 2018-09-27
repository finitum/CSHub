import {Action} from '@ngrx/store';

export enum TestActionsEnum {
    TEST_ACTION = 'TEST_ACTION'
}

export class TestAction implements Action {
    readonly type = TestActionsEnum.TEST_ACTION;

    constructor(public payload: number) {
    }
}

export type TestActions = TestAction;
