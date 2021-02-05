"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const allure_js_commons_1 = require("allure-js-commons");
const jest_allure_interface_1 = require("./jest-allure-interface");
const crypto_1 = require("crypto");
const category_definitions_1 = require("./category-definitions");
const jest_docblock_1 = require("jest-docblock");
const stripAnsi = require("strip-ansi");
const _ = require("lodash");
const prettier = require("prettier/standalone");
const parser = require("prettier/parser-typescript");
class AllureReporter {
    constructor(options) {
        var _a, _b;
        this.currentExecutable = null;
        this.suites = [];
        this.steps = [];
        this.tests = [];
        this.categories = category_definitions_1.default;
        this.allureRuntime = options.allureRuntime;
        this.jiraUrl = (_a = options.jiraUrl) !== null && _a !== void 0 ? _a : 'https://github.com/ryparker/jest-circus-allure-environment/blob/master/README.md';
        this.tmsUrl = (_b = options.tmsUrl) !== null && _b !== void 0 ? _b : 'https://github.com/ryparker/jest-circus-allure-environment/blob/master/README.md';
        if (options.environmentInfo) {
            this.allureRuntime.writeEnvironmentInfo(options.environmentInfo);
        }
        if (options.categories) {
            this.categories = [
                ...this.categories,
                ...options.categories
            ];
        }
        this.allureRuntime.writeCategoriesDefinitions(this.categories);
    }
    getImplementation() {
        return new jest_allure_interface_1.default(this, this.allureRuntime, this.jiraUrl);
    }
    get currentSuite() {
        return this.suites.length > 0 ? this.suites[this.suites.length - 1] : null;
    }
    get currentStep() {
        return this.steps.length > 0 ? this.steps[this.steps.length - 1] : null;
    }
    get currentTest() {
        return this.tests.length > 0 ? this.tests[this.tests.length - 1] : null;
    }
    environmentInfo(info) {
        this.allureRuntime.writeEnvironmentInfo(info);
    }
    startTestFile(suiteName) {
        this.startSuite(suiteName);
    }
    endTestFile() {
        this.suites.forEach(_ => {
            this.endSuite();
        });
    }
    startSuite(suiteName) {
        var _a;
        const scope = (_a = this.currentSuite) !== null && _a !== void 0 ? _a : this.allureRuntime;
        const suite = scope.startGroup(suiteName !== null && suiteName !== void 0 ? suiteName : 'Global');
        this.pushSuite(suite);
    }
    endSuite() {
        if (this.currentSuite === null) {
            throw new Error('endSuite called while no suite is running');
        }
        if (this.steps.length > 0) {
            this.steps.forEach(step => {
                step.endStep();
            });
        }
        if (this.tests.length > 0) {
            this.tests.forEach(test => {
                test.endTest();
            });
        }
        this.currentSuite.endGroup();
        this.popSuite();
    }
    startHook(type) {
        const suite = this.currentSuite;
        if (suite && type.startsWith('before')) {
            this.currentExecutable = suite.addBefore();
        }
        if (suite && type.startsWith('after')) {
            this.currentExecutable = suite.addAfter();
        }
    }
    endHook(error) {
        if (this.currentExecutable === null) {
            throw new Error('endHook called while no executable is running');
        }
        if (error) {
            const { status, message, trace } = this.handleError(error);
            this.currentExecutable.status = status;
            this.currentExecutable.statusDetails = { message, trace };
            this.currentExecutable.stage = allure_js_commons_1.Stage.FINISHED;
        }
        if (!error) {
            this.currentExecutable.status = allure_js_commons_1.Status.PASSED;
            this.currentExecutable.stage = allure_js_commons_1.Stage.FINISHED;
        }
    }
    startTestCase(test, state, testPath) {
        var _a, _b;
        if (this.currentSuite === null) {
            throw new Error('startTestCase called while no suite is running');
        }
        let currentTest = this.currentSuite.startTest(test.name);
        currentTest.fullName = test.name;
        currentTest.historyId = crypto_1.createHash('md5')
            .update(testPath + '.' + test.name)
            .digest('hex');
        currentTest.stage = allure_js_commons_1.Stage.RUNNING;
        if (test.fn) {
            const serializedTestCode = test.fn.toString();
            const { code, comments, pragmas } = this.extractCodeDetails(serializedTestCode);
            this.setAllureReportPragmas(currentTest, pragmas);
            currentTest.description = `${comments}\n### Test\n\`\`\`typescript\n${code}\n\`\`\`\n`;
        }
        if (!test.fn) {
            currentTest.description = '### Test\nCode is not available.\n';
        }
        if ((_b = (_a = state.parentProcess) === null || _a === void 0 ? void 0 : _a.env) === null || _b === void 0 ? void 0 : _b.JEST_WORKER_ID) {
            currentTest.addLabel(allure_js_commons_1.LabelName.THREAD, state.parentProcess.env.JEST_WORKER_ID);
        }
        currentTest = this.addSuiteLabelsToTestCase(currentTest, testPath);
        this.pushTest(currentTest);
    }
    passTestCase() {
        if (this.currentTest === null) {
            throw new Error('passTestCase called while no test is running');
        }
        this.currentTest.status = allure_js_commons_1.Status.PASSED;
    }
    pendingTestCase(test) {
        if (this.currentTest === null) {
            throw new Error('pendingTestCase called while no test is running');
        }
        this.currentTest.status = allure_js_commons_1.Status.SKIPPED;
        this.currentTest.statusDetails = { message: `Test is marked: "${test.mode}"` };
    }
    failTestCase(error) {
        if (this.currentTest === null) {
            throw new Error('failTestCase called while no test is running');
        }
        const latestStatus = this.currentTest.status;
        // If test already has a failed/broken state, we should not overwrite it
        const isBrokenTest = latestStatus === allure_js_commons_1.Status.BROKEN && this.currentTest.stage !== allure_js_commons_1.Stage.RUNNING;
        if (latestStatus === allure_js_commons_1.Status.FAILED || isBrokenTest) {
            return;
        }
        const { status, message, trace } = this.handleError(error);
        this.currentTest.status = status;
        this.currentTest.statusDetails = { message, trace };
    }
    endTest() {
        if (this.currentTest === null) {
            throw new Error('endTest called while no test is running');
        }
        this.currentTest.stage = allure_js_commons_1.Stage.FINISHED;
        this.currentTest.endTest();
        this.popTest();
    }
    writeAttachment(content, type) {
        return this.allureRuntime.writeAttachment(content, type);
    }
    pushStep(step) {
        this.steps.push(step);
    }
    popStep() {
        this.steps.pop();
    }
    pushTest(test) {
        this.tests.push(test);
    }
    popTest() {
        this.tests.pop();
    }
    pushSuite(suite) {
        this.suites.push(suite);
    }
    popSuite() {
        this.suites.pop();
    }
    handleError(error) {
        var _a;
        if (Array.isArray(error)) {
            // Test_done event sends an array of arrays containing errors.
            error = _.flattenDeep(error)[0];
        }
        let status = allure_js_commons_1.Status.BROKEN;
        let message = error.name;
        let trace = error.message;
        if (error.matcherResult) {
            status = allure_js_commons_1.Status.FAILED;
            const matcherMessage = error.matcherResult.message();
            const [line1, line2, ...restOfMessage] = matcherMessage.split('\n');
            message = [line1, line2].join('\n');
            trace = restOfMessage.join('\n');
        }
        if (!trace) {
            trace = error.stack;
        }
        if (!message && trace) {
            message = trace;
            trace = (_a = error.stack) === null || _a === void 0 ? void 0 : _a.replace(message, 'No stack trace provided');
        }
        if (trace === null || trace === void 0 ? void 0 : trace.includes(message)) {
            trace = trace === null || trace === void 0 ? void 0 : trace.replace(message, '');
        }
        if (!message) {
            message = 'Error. Expand for more details.';
            trace = error;
        }
        return {
            status,
            message: stripAnsi(message),
            trace: stripAnsi(trace)
        };
    }
    extractCodeDetails(serializedTestCode) {
        const docblock = this.extractDocBlock(serializedTestCode);
        const { pragmas, comments } = jest_docblock_1.parseWithComments(docblock);
        let code = serializedTestCode.replace(docblock, '');
        // Add newline before the first expect()
        code = code.split(/(expect[\S\s.]*)/g).join('\n');
        code = prettier.format(code, { parser: 'typescript', plugins: [parser] });
        return { code, comments, pragmas };
    }
    extractDocBlock(contents) {
        const docblockRe = /^\s*(\/\*\*?(.|\r?\n)*?\*\/)/gm;
        const match = contents.match(docblockRe);
        return match ? match[0].trimStart() : '';
    }
    setAllureReportPragmas(currentTest, pragmas) {
        for (let [pragma, value] of Object.entries(pragmas)) {
            if (value instanceof String && value.includes(',')) {
                value = value.split(',');
            }
            if (Array.isArray(value)) {
                value.forEach(v => {
                    this.setAllureLabelsAndLinks(currentTest, pragma, v);
                });
            }
            if (!Array.isArray(value)) {
                this.setAllureLabelsAndLinks(currentTest, pragma, value);
            }
        }
    }
    setAllureLabelsAndLinks(currentTest, labelName, value) {
        switch (labelName) {
            case 'issue':
                currentTest.addLink(`${this.jiraUrl}${value}`, value, allure_js_commons_1.LinkType.ISSUE);
                break;
            case 'tms':
                currentTest.addLink(`${this.tmsUrl}${value}`, value, allure_js_commons_1.LinkType.TMS);
                break;
            case 'tag':
            case 'tags':
                currentTest.addLabel(allure_js_commons_1.LabelName.TAG, value);
                break;
            case 'milestone':
                currentTest.addLabel(labelName, value);
                currentTest.addLabel('epic', value);
                break;
            default:
                currentTest.addLabel(labelName, value);
                break;
        }
    }
    addSuiteLabelsToTestCase(currentTest, testPath) {
        const isWindows = os.type() === 'Windows_NT';
        const pathDelimiter = isWindows ? '\\' : '/';
        const pathsArray = testPath.split(pathDelimiter);
        const [parentSuite, ...suites] = pathsArray;
        const subSuite = suites.pop();
        if (parentSuite) {
            currentTest.addLabel(allure_js_commons_1.LabelName.PARENT_SUITE, parentSuite);
            currentTest.addLabel(allure_js_commons_1.LabelName.PACKAGE, parentSuite);
        }
        if (suites.length > 0) {
            currentTest.addLabel(allure_js_commons_1.LabelName.SUITE, suites.join(' > '));
        }
        if (subSuite) {
            currentTest.addLabel(allure_js_commons_1.LabelName.SUB_SUITE, subSuite);
        }
        return currentTest;
    }
    // TODO: Use if describe blocks are present.
    collectTestParentNames(parent) {
        const testPath = [];
        do {
            testPath.unshift(parent === null || parent === void 0 ? void 0 : parent.name);
        } while ((parent = parent === null || parent === void 0 ? void 0 : parent.parent));
        return testPath;
    }
}
exports.default = AllureReporter;
//# sourceMappingURL=allure-reporter.js.map