import * as assert from "assert";
import logger from "../utilities/Logger";

export function checkAndFixType<TYPE, TYPEACTUAL extends TYPE>(
    properties: Record<keyof TYPE, true>,
    actual: Record<keyof TYPEACTUAL, true>
) {
    Object.keys(properties).forEach(property => {
        if (!actual.hasOwnProperty(property)) {
            assert.fail("See logging");
            logger.error(`Missing property ${property} in the actual object, actual object:`);
            logger.error(actual);
            logger.error("Expected object:");
            logger.error(properties);
        }
    });

    Object.keys(actual).forEach(property => {
        if (!properties.hasOwnProperty(property)) {
            delete actual[property];
        }
    });

    return actual;
}
