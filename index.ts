import BookManager from "./src/book";
import { MetaConfig } from './src/manager';

module.exports.MetaManager = class {
    config: MetaConfig;

    book: BookManager;

    constructor(config: MetaConfig) {
        this.config = config;
        this.book = new BookManager(config);
    }
}