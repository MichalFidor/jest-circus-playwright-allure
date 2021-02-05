/// <reference types="node" />
import type { AllureStep, StepInterface, Stage } from 'allure-js-commons';
import type { ContentType } from './types';
import { Status } from 'allure-js-commons';
import type AllureReporter from './allure-reporter';
export default class StepWrapper {
    private readonly reporter;
    private readonly step;
    constructor(reporter: AllureReporter, step: AllureStep);
    get name(): string;
    set name(name: string);
    get status(): Status;
    set status(status: Status);
    get stage(): Stage;
    set stage(stage: Stage);
    parameter(name: string, value: string): void;
    attachment(name: string, content: Buffer | string, type: ContentType): void;
    startStep(name: string): StepWrapper;
    endStep(): void;
    run<T>(body: (step: StepInterface) => T): T;
}
