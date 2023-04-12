import { AbstractManager, IMetaOptions, IMetaInfo } from './manager';
import * as gb from '../api/google-book';
import * as isbnDB from '../api/isbndb';

interface IComicOptions extends IMetaOptions {
    isbn: number;
};

interface IComicInfo extends IMetaInfo {
    authors?: Array<string>;
    description?: string;
    thumbnail?: string;
    pageCount?: number;
    publisher?: string;
};

const ComicInfoProperties = [
    'title',
    'authors',
    'publishDate',
    'description',
    'language',
    'thumbnail',
    'pageCount',
    'publisher',
] as const;

function undefinedProperties(ComicInfo: IComicInfo): string[] {
    return ComicInfoProperties.filter(prop => !ComicInfo[prop]);
}

export default class ComicManager extends AbstractManager {
    dbFilename: string = "comics.json";

    DBPath(): string {
        return this.config.dbPath + '/' + this.dbFilename;
    };

    uniqID(options: IComicOptions): string {
        return '' + options.isbn; // to string
    }

    async fetchFromGoogle(options: IComicOptions): Promise<IComicInfo> {
        const volumeInfo = await gb.search(options.isbn);

        return {
            title: volumeInfo?.title,
            authors: volumeInfo?.authors,
            date: volumeInfo?.publishedDate,
            description: volumeInfo?.description,
            language: volumeInfo?.language,
            pageCount: volumeInfo?.pageCount,
            publisher: volumeInfo?.publisher,
            thumbnail:
                volumeInfo?.imageLinks?.extraLarge ||
                volumeInfo?.imageLinks?.large ||
                volumeInfo?.imageLinks?.medium
        };
    }

    async fetchFromISBNDB(options: IComicOptions): Promise<IComicInfo> {
        const meta = await isbnDB.find(options.isbn);

        return {
            title: meta?.title_long,
            // no description
            authors: meta?.authors,
            date: meta?.date_published,
            language: meta?.language,
            thumbnail: meta?.image,
            pageCount: meta?.pages,
            publisher: meta?.publisher,
        };
    }

    async fetchInfo(options: IComicOptions): Promise<IComicInfo> {
        var ComicInfo: IComicInfo = await this.fetchFromGoogle(options);

        const properties = undefinedProperties(ComicInfo);
        if (properties.length) {
            const isbnDBMeta = await this.fetchFromISBNDB(options);
            properties.forEach((prop) => {
                ComicInfo[prop] = isbnDBMeta[prop];
            })
        }

        this.setCache(options, ComicInfo);
        return ComicInfo;
    }
}