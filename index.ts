import AnimeManager from './src/anime';
import BookManager from './src/book';
import MusicManager from './src/music';
import { IMetaConfig } from './src/manager';

module.exports.MetaManager = class {
    config: IMetaConfig;

    anime: AnimeManager;
    book: BookManager;
    music: MusicManager;

    constructor(config: IMetaConfig) {
        this.config = config;

        this.anime = new AnimeManager(config);
        this.book = new BookManager(config);
        this.music = new MusicManager(config);
    }
}