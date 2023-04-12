import AnimeManager from './src/anime';
import BookManager from './src/book';
import ComicManager from './src/comic';
import MusicManager from './src/music';
import { IMetaConfig } from './src/manager';

export class MetaManager {
    config: IMetaConfig;

    anime: AnimeManager;
    book: BookManager;
    comic: ComicManager;
    music: MusicManager;

    constructor(config: IMetaConfig) {
        this.config = config;

        this.anime = new AnimeManager(config);
        this.book = new BookManager(config);
        this.comic = new ComicManager(config);
        this.music = new MusicManager(config);
    }
}