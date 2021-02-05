"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlaywrightLibEnv = require('jest-playwright-preset/lib/PlaywrightEnvironment')
    .default;
const allure_js_commons_1 = require("allure-js-commons");
const allure_reporter_1 = require("./allure-reporter");
const path_1 = require("path");
class AllureNodeEnvironment extends PlaywrightLibEnv {
    constructor(config, context) {
        super(config);
        if (typeof config.testEnvironmentOptions.testPath === 'string') {
            this.testPath = config.testEnvironmentOptions.testPath;
        }
        this.testPath = this.initializeTestPath(config, context);
        this.testFileName = path_1.basename(this.testPath);
        this.reporter = this.initializeAllureReporter(config);
        this.global.allure = this.reporter.getImplementation();
        this.global.page.setDefaultTimeout(60 * 1000);
    }
    initializeTestPath(config, context) {
        var _a;
        let testPath = (_a = context.testPath) !== null && _a !== void 0 ? _a : '';
        if (typeof config.testEnvironmentOptions.testPath === 'string') {
            testPath = testPath === null || testPath === void 0 ? void 0 : testPath.replace(config.testEnvironmentOptions.testPath, '');
        }
        if (typeof config.testEnvironmentOptions.testPath !== 'string') {
            testPath = testPath === null || testPath === void 0 ? void 0 : testPath.replace(config.rootDir, '');
        }
        if (testPath.startsWith('/')) {
            testPath = testPath.slice(1);
        }
        return testPath;
    }
    initializeAllureReporter(config) {
        var _a, _b, _c, _d, _e;
        const allureConfig = {
            resultsDir: (_a = config.testEnvironmentOptions.resultsDir) !== null && _a !== void 0 ? _a : 'allure-results'
        };
        return new allure_reporter_1.default({
            allureRuntime: new allure_js_commons_1.AllureRuntime(allureConfig),
            jiraUrl: (_b = config.testEnvironmentOptions) === null || _b === void 0 ? void 0 : _b.jiraUrl,
            tmsUrl: (_c = config.testEnvironmentOptions) === null || _c === void 0 ? void 0 : _c.tmsUrl,
            environmentInfo: (_d = config.testEnvironmentOptions) === null || _d === void 0 ? void 0 : _d.environmentInfo,
            categories: (_e = config.testEnvironmentOptions) === null || _e === void 0 ? void 0 : _e.categories
        });
    }
    async setup() {
        return super.setup();
    }
    async teardown() {
        return super.teardown();
    }
    handleTestEvent(event, state) {
        // Console.log(`Event: ${event.name}`);
        // Console.log({event});
        var _a;
        switch (event.name) {
            case 'setup':
                break;
            case 'add_hook':
                break;
            case 'add_test':
                break;
            case 'run_start':
                this.reporter.startTestFile(this.testFileName);
                break;
            case 'test_skip':
                this.reporter.startTestCase(event.test, state, this.testPath);
                this.reporter.pendingTestCase(event.test);
                break;
            case 'test_todo':
                this.reporter.startTestCase(event.test, state, this.testPath);
                this.reporter.pendingTestCase(event.test);
                break;
            case 'start_describe_definition':
                /**
                 * @privateRemarks
                 * Only called if "describe()" blocks are present.
                 */
                break;
            case 'finish_describe_definition':
                /**
                 * @privateRemarks
                 * Only called if "describe()" blocks are present.
                 */
                break;
            case 'run_describe_start':
                /**
                 * @privateRemarks
                 * This is called at the start of a test file.
                 * Even if there are no describe blocks.
                 */
                this.reporter.startSuite(event.describeBlock.name);
                break;
            case 'test_start':
                /**
                 * @privateRemarks
                 * This is called after beforeAll and before the beforeEach hooks.
                 * If we start the test case here, allure will include the beforeEach
                 * hook as part of the "test body" instead of the "Set up".
                 */
                // This.reporter.startTestCase(event.test, state, this.testPath);
                break;
            case 'hook_start':
                this.reporter.startHook(event.hook.type);
                break;
            case 'hook_success':
                this.reporter.endHook();
                break;
            case 'hook_failure':
                this.reporter.endHook((_a = event.error) !== null && _a !== void 0 ? _a : event.hook.asyncError);
                break;
            case 'test_fn_start':
                /**
                 * @privateRemarks
                 * This is called after the beforeAll and after the beforeEach.
                 * Making this the most reliable event to start the test case, so
                 * that only the test context is captured in the allure
                 * "Test body" execution.
                 */
                this.reporter.startTestCase(event.test, state, this.testPath);
                break;
            case 'test_fn_success':
                if (event.test.errors.length > 0) {
                    this.reporter.failTestCase(event.test.errors[0]);
                }
                else {
                    this.reporter.passTestCase();
                }
                break;
            case 'test_fn_failure':
                this.reporter.failTestCase(event.test.errors[0]);
                break;
            case 'test_done':
                /**
                 * @privateRemarks
                 * This is called once the test has completed (includes hooks).
                 * This is more reliable for error collection because some failures
                 * like Snapshot failures will only appear in this event.
                 */
                /**
                 * @privateRemarks -Issue-
                 * If we capture errors from both test_done and test_fn_failure
                 * the test case will be overriden causing allure to lose any
                 * test context like steps that the overriden test case may have
                 * had.
                 * A workaround might be to refactor the AllureReporter class
                 * by decoupling the endTestCase method from the passTestCase,
                 * failTestCase, and pendingTestCase methods.
                 */
                /**
                 * @privateRemarks -Issue-
                 * afterEach hooks appears in the allure "test body".
                 */
                if (event.test.errors.length > 0) {
                    this.reporter.failTestCase(event.test.errors[0]);
                }
                this.reporter.endTest();
                break;
            case 'run_describe_finish':
                /**
                 * @privateRemarks
                 * This is called at the end of a describe block or test file. If a
                 * describe block is not present in the test file, this event will
                 * still be called at the end of the test file.
                 */
                this.reporter.endSuite();
                break;
            case 'run_finish':
                this.reporter.endTestFile();
                break;
            case 'teardown':
                break;
            case 'error':
                /**
                 * @privateRemarks
                 * Haven't found a good example of when this is emitted yet.
                 */
                // console.log('ERROR EVENT:', event);
                break;
            default:
                /**
                 * @privateRemarks
                 * Haven't found a good example of when this is emitted yet.
                */
                // console.log('UNHANDLED EVENT:', event);
                break;
        }
    }
}
exports.default = AllureNodeEnvironment;
//# sourceMappingURL=allure-node-environment.js.map