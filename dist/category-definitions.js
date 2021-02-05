"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const allure_js_commons_1 = require("allure-js-commons");
const categories = [
    {
        name: 'Response status failures',
        description: 'Unexpected API response status code.',
        messageRegex: '.*toHaveStatusCode.*',
        matchedStatuses: [
            allure_js_commons_1.Status.FAILED
        ]
    },
    {
        name: 'Response time failures',
        description: 'API responses that took longer than expected.',
        messageRegex: '.*toHaveResponseTimeBelow.*',
        matchedStatuses: [
            allure_js_commons_1.Status.FAILED
        ]
    },
    {
        name: 'JSON schema failures',
        description: 'An object did not validate against an expected JSON schema.',
        messageRegex: '.*toMatchSchema.*',
        matchedStatuses: [
            allure_js_commons_1.Status.FAILED
        ]
    },
    {
        name: 'Property name failures',
        description: 'An object had keys that were not camelCase.',
        messageRegex: '.*toHaveCamelCase.*',
        matchedStatuses: [
            allure_js_commons_1.Status.FAILED
        ]
    },
    {
        name: 'Snapshot failures',
        description: 'Snapshot does not match the expected snapshot.',
        messageRegex: '.*toMatchSnapshot.*',
        matchedStatuses: [
            allure_js_commons_1.Status.FAILED
        ]
    },
    {
        name: 'Timed out',
        description: 'The test exceeded the test threshold.',
        traceRegex: '.*Exceeded timeout.*',
        matchedStatuses: [
            allure_js_commons_1.Status.BROKEN
        ]
    },
    {
        name: 'Updated JSON schemas',
        description: 'Tests that have updated a JSON schema.',
        messageRegex: '.*updated.*schema.*updated.*',
        matchedStatuses: [
            allure_js_commons_1.Status.PASSED
        ]
    },
    {
        name: 'Updated snapshots',
        description: 'Tests that have updated a snapshot.',
        messageRegex: '.*updated.*snapshots.*updated.*',
        matchedStatuses: [
            allure_js_commons_1.Status.PASSED
        ]
    },
    {
        name: 'Skipped tests',
        description: 'Tests that were skipped in this run.',
        matchedStatuses: [
            allure_js_commons_1.Status.SKIPPED
        ]
    }
];
exports.default = categories;
//# sourceMappingURL=category-definitions.js.map