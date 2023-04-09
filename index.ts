import BookManager from "./src/book";
import BookInfo from "./src/book";
import { MetaConfig } from './types';

module.exports.MetaManager = class {
    config: MetaConfig;

    book: BookManager;

    constructor(config: MetaConfig) {
        this.config = config;
        this.book = new BookManager({
            dbPath: this.config.dbPath + '/books'
        });
    }
}