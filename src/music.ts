import { MusicBrainzApi, ICoverArtArchive } from 'musicbrainz-api';
import { MetaManager, MetaOptions } from './manager';
import { name, version } from '../package.json';
import axios from 'axios';

const config = {
    // API base URL, default: 'https://musicbrainz.org' (optionsal)
    baseUrl: 'https://musicbrainz.org',

    appName: name,
    appVersion: version,

    // Your e-mail address, required for submitting ISRCs
    appMail: 'cerallin@cerallin.top',
};

const mbApi = new MusicBrainzApi(config);

interface MusicOptions extends MetaOptions {
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

    uniqID(options: MusicOptions): string {
        return options.discID;
    }

    async browseArtists(discID: string, limit: number = 3): Promise<string[]> {
        const res = await mbApi.browseArtists({ release: discID, limit: limit });
        return res.artists.map(artist => artist.name);
    }

    async coverArt(discID: string, caArchive: ICoverArtArchive): Promise<string> {
        if (!caArchive.front) {
            return "";
        }
        const { headers } = await axios.get(
            `https://coverartarchive.org/release/${discID}/front`, {
            maxRedirects: 0,
            validateStatus: function (status) {
                return status == 307 || (status <= 200 && status < 300);
            },
        });
        return headers.location
    }

    async fetchInfo(options: MusicOptions): Promise<MusicInfo> {
        const discID = options.discID;
        const iRel = await mbApi.lookupRelease(discID);
        let musicInfo: MusicInfo = {
            title: iRel.title,
            publishDate: iRel.date,
            language: iRel['text-representation'].language,
        };
        // artists and coverArt
        const [artists, coverArt] = await Promise.all([
            this.browseArtists(discID),
            this.coverArt(discID, iRel['cover-art-archive']),
        ]);
        musicInfo.artists = artists;
        musicInfo.cover = coverArt;

        this.setCache(options, musicInfo);
        return musicInfo;
    }
}