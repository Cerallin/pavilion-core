import { MetaManager, IMetaOptions, IMetaInfo } from './manager';
import * as mbApi from '../api/musicbrainz';

interface IMusicOptions extends IMetaOptions {
    discID: string;
}

interface IMusicInfo extends IMetaInfo {
    title?: string;
    artists?: Array<string>;
    publishDate?: string;
    language?: string;
    cover?: string;
}

export default class MusicManager extends MetaManager {
    dbFilename: string = "music.json";

    DBPath(): string {
        return this.config.dbPath + '/' + this.dbFilename;
    };

    uniqID(options: IMusicOptions): string {
        return options.discID;
    }

    async fetchInfo(options: IMusicOptions): Promise<IMusicInfo> {
        const discID = options.discID;
        const iRel = await mbApi.lookupRelease(discID);
        let musicInfo: IMusicInfo = {
            title: iRel.title,
            publishDate: iRel.date,
            language: iRel['text-representation'].language,
        };
        // artists and coverArt
        const [artists, coverArt] = await Promise.all([
            mbApi.browseArtists(discID),
            mbApi.coverArt(discID, iRel['cover-art-archive']),
        ]);
        musicInfo.artists = artists;
        musicInfo.cover = coverArt;

        this.setCache(options, musicInfo);
        return musicInfo;
    }
}