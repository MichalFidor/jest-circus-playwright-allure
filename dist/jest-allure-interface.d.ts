/// <reference types="node" />
import { Allure, AllureRuntime, AllureStep, AllureTest, ExecutableItemWrapper, Severity, Status, StepInterface } from 'allure-js-commons';
import StepWrapper from './step-wrapper';
import type AllureReporter from './allure-reporter';
import type { ContentType } from './types';
export default class JestAllureInterface extends Allure {
    private readonly reporter;
    jiraUrl: string;
    tmsUrl: string;
    constructor(reporter: AllureReporter, runtime: AllureRuntime, jiraUrl?: string);
    get currentExecutable(): AllureStep | AllureTest | ExecutableItemWrapper;
    set currentExecutable(executable: AllureStep | AllureTest | ExecutableItemWrapper);
    label(name: string, value: string): void;
    severity(severity: Severity): void;
    tag(tag: string): void;
    owner(owner: string): void;
    lead(lead: string): void;
    epic(epic: string): void;
    feature(feature: string): void;
    story(story: string): void;
    issue(name: string): void;
    tms(name: string): void;
    startStep(name: string): StepWrapper;
    step<T>(name: string, body: (step: StepInterface) => any): any;
    logStep(name: string, status: Status, attachments?: Array<{
        name: string;
        content: string;
        type: ContentType;
    }>): void;
    description(markdown: string): void;
    descriptionHtml(html: string): void;
    attachment(name: string, content: Buffer | string, type: ContentType): void;
    testAttachment(name: string, content: Buffer | string, type: ContentType): void;
    get currentTest(): AllureTest;
}
