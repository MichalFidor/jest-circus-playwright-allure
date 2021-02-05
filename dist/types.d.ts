import type { ContentType as AllureContentType } from 'allure-js-commons';
declare enum CustomContentType {
    HTML = "text/html"
}
export declare type ContentType = AllureContentType | CustomContentType;
export {};
