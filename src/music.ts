import { MusicBrainzApi } from 'musicbrainz-api';
import { MetaManager, MetaOption } from './manager';
import { name, version } from '../package.json';
import axios from 'axios';

const config = {
    // API base URL, default: 'https://musicbrainz.org' (optional)
    baseUrl: 'https://musicbrainz.org',

    appName: name,
    appVersion: version,

    // Your e-mail address, required for submitting ISRCs
    appMail: 'cerallin@cerallin.top',
};

const mbApi = new MusicBrainzApi(config);

interface MusicOption extends MetaOption {
    discID: string
}

interface MusicInfo {
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

    uniqID(option: MusicOption): string {
        return option.discID;
    }

    async downloadInfo(option: MusicOption): Promise<MusicInfo> {
        const iRel = await mbApi.lookupRelease(option.discID);
        // cover art
        const ca = iRel['cover-art-archive'];
        let musicInfo: MusicInfo = {
            title: iRel.title,
            artists: iRel['artist-credit']?.map(iac => iac.artist.name),
            publishDate: iRel.date,
            language: iRel['text-representation'].language,
        };
        if (ca.front) {
            const { status, data, headers } = await axios.get(
                `https://coverartarchive.org/release/${option.discID}/front`, {
                maxRedirects: 0,
                validateStatus: function (status) {
                    return status == 307 || (status <= 200 && status < 300);
                },
            });
            musicInfo.cover = headers.location
        }

        this.setCache(option, musicInfo);
        return musicInfo;
    }
}