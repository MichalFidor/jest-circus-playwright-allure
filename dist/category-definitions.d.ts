import { Status } from 'allure-js-commons';
declare const categories: ({
    name: string;
    description: string;
    messageRegex: string;
    matchedStatuses: Status[];
    traceRegex?: undefined;
} | {
    name: string;
    description: string;
    traceRegex: string;
    matchedStatuses: Status[];
    messageRegex?: undefined;
} | {
    name: string;
    description: string;
    matchedStatuses: Status[];
    messageRegex?: undefined;
    traceRegex?: undefined;
})[];
export default categories;
