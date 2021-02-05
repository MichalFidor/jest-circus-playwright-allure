declare const PlaywrightLibEnv: any;
import type { Circus, Config } from '@jest/types';
import AllureReporter from './allure-reporter';
import type { EnvironmentContext } from '@jest/environment';
export default class AllureNodeEnvironment extends PlaywrightLibEnv {
    private readonly reporter;
    private readonly testPath;
    private readonly testFileName;
    constructor(config: Config.ProjectConfig, context: EnvironmentContext);
    initializeTestPath(config: Config.ProjectConfig, context: EnvironmentContext): string;
    initializeAllureReporter(config: Config.ProjectConfig): AllureReporter;
    setup(): Promise<any>;
    teardown(): Promise<any>;
    handleTestEvent(event: Circus.Event, state: Circus.State): void;
}
export {};
