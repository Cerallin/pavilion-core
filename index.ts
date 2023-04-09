import BookManager from './src/book';
import MusicManager from './src/music';
import { MetaConfig } from './src/manager';

module.exports.MetaManager = class {
    config: MetaConfig;

    book: BookManager;
    music: MusicManager;

    constructor(config: MetaConfig) {
        this.config = config;
        this.book = new BookManager(config);
        this.music = new MusicManager(config);
    }
}