import {TestActions, TestActionsEnum} from './test.actions';

import {initialState} from './test.state';

export function testReducer(state = initialState, action: TestActions) {
    switch (action.type) {
        case TestActionsEnum.TEST_ACTION:
            return {
                ...state,
                test: action.payload
            };
        default:
            return state;
    }
}
