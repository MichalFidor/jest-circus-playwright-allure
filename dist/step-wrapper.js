"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const allure_js_commons_1 = require("allure-js-commons");
class StepWrapper {
    constructor(reporter, step) {
        this.reporter = reporter;
        this.step = step;
    }
    get name() {
        return this.step.name;
    }
    set name(name) {
        this.step.name = name;
    }
    get status() {
        var _a;
        return (_a = this.step.status) !== null && _a !== void 0 ? _a : allure_js_commons_1.Status.PASSED;
    }
    set status(status) {
        this.step.status = status;
    }
    get stage() {
        return this.step.stage;
    }
    set stage(stage) {
        this.step.stage = stage;
    }
    parameter(name, value) {
        this.step.addParameter(name, value);
    }
    attachment(name, content, type) {
        const file = this.reporter.writeAttachment(content, type);
        this.step.addAttachment(name, type, file);
    }
    startStep(name) {
        const step = this.step.startStep(name);
        this.reporter.pushStep(step);
        return new StepWrapper(this.reporter, step);
    }
    endStep() {
        this.reporter.popStep();
        this.step.endStep();
    }
    run(body) {
        return this.step.wrap(body)();
    }
}
exports.default = StepWrapper;
//# sourceMappingURL=step-wrapper.js.map