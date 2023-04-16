import axios from '../axios';
import { MusicBrainzApi, ICoverArtArchive, IRelease } from 'musicbrainz-api';
import { package_name, package_version } from '../ua';

const mbApi = new MusicBrainzApi({
    // API base URL, default: 'https://musicbrainz.org' (optionsal)
    baseUrl: 'https://musicbrainz.org',

    appName: package_name,
    appVersion: package_version,
});

export function lookupRelease(discID): Promise<IRelease> {
    return mbApi.lookupRelease(discID);
}

export async function coverArt(
    discID: string, caArchive: ICoverArtArchive): Promise<string> {

    if (!caArchive.front) {
        return "";
    }
    const { status, headers } = await axios().get(
        `https://coverartarchive.org/release/${discID}/front`, {
        maxRedirects: 0,
        validateStatus: function (status) {
            return status == 307 ||
                status == 404 ||
                (status <= 200 && status < 300);
        },
    });

    if (status == 404) {
        return "";
    }

    return headers.location;
}

export async function browseArtists(
    discID: string, limit: number = 3): Promise<string[]> {

    const res = await mbApi.browseArtists({ release: discID, limit: limit });

    return res.artists.map(artist => artist.name);
}
