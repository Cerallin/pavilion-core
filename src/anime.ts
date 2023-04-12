import { MetaManager, IMetaOptions, IMetaInfo } from './manager';
import * as bgm from '../api/bangumi';

interface IAnimeOptions extends IMetaOptions {
    subject_id: number;
}

interface IAnimeInfo extends IMetaInfo {
    title?: string;
    platform?: string;
    description?: string;
    date?: string;
    thumbnail?: string;
    episodes_count?: number;
};

export default class BookManager extends MetaManager {
    dbFilename: string = "anime.json";

    DBPath(): string {
        return this.config.dbPath + '/' + this.dbFilename;
    };

    uniqID(options: IAnimeOptions): string {
        return '' + options.subject_id; // to string
    }

    async fetchFromGBangumi(options: IAnimeOptions): Promise<IAnimeInfo> {
        const meta = await bgm.getSubject(options.subject_id);

        return {
            title: meta.name,
            platform: meta.platform,
            description: meta.summary,
            date: meta.date,
            episodes_count: meta.total_episodes,
            thumbnail:
                meta.images.large ||
                meta.images.medium ||
                meta.images.common ||
                meta.images.small ||
                meta.images.grid,
        };
    }

    async fetchInfo(options: IAnimeOptions): Promise<IAnimeInfo> {
        const animeInfo: IAnimeInfo = await this.fetchFromGBangumi(options);
        this.setCache(options, animeInfo);

        return animeInfo;
    }
}