import axios from '../axios';
import { MusicBrainzApi, ICoverArtArchive, IRelease } from 'musicbrainz-api';

const package_name = process.env.npm_package_name;
const package_version = process.env.npm_package_version;

const config = {
    // API base URL, default: 'https://musicbrainz.org' (optionsal)
    baseUrl: 'https://musicbrainz.org',

    appName: package_name,
    appVersion: package_version,

    // Your e-mail address, required for submitting ISRCs
    appMail: 'cerallin@cerallin.top',
};

const mbApi = new MusicBrainzApi(config);

export function lookupRelease(discID): Promise<IRelease> {
    return mbApi.lookupRelease(discID);
}

export async function coverArt(
    discID: string, caArchive: ICoverArtArchive): Promise<string> {

    if (!caArchive.front) {
        return "";
    }
    const { headers } = await axios().get(
        `https://coverartarchive.org/release/${discID}/front`, {
        maxRedirects: 0,
        validateStatus: function (status) {
            return status == 307 || (status <= 200 && status < 300);
        },
    });

    return headers.location;
}

export async function browseArtists(
    discID: string, limit: number = 3): Promise<string[]> {

    const res = await mbApi.browseArtists({ release: discID, limit: limit });

    return res.artists.map(artist => artist.name);
}
