import { AbstractManager, IMetaOptions, IMetaInfo } from './manager';
import * as gb from '../api/google-book';
import * as isbnDB from '../api/isbndb';

interface IBookOptions extends IMetaOptions {
    isbn: number;
};

interface IBookInfo extends IMetaInfo {
    authors?: Array<string>;
    description?: string;
    thumbnail?: string;
};

const BookInfoProperties = [
    'title',
    'authors',
    'publishDate',
    'description',
    'language',
    'thumbnail',
] as const;

function undefinedProperties(bookInfo: IBookInfo): string[] {
    return BookInfoProperties.filter(prop => !bookInfo[prop]);
}

export default class BookManager extends AbstractManager {
    dbFilename: string = "books.json";

    DBPath(): string {
        return this.config.dbPath + '/' + this.dbFilename;
    };

    uniqID(options: IBookOptions): string {
        return '' + options.isbn; // to string
    }

    async fetchFromGoogle(options: IBookOptions): Promise<IBookInfo> {
        const volumeInfo = await gb.search(options.isbn);

        return {
            title: volumeInfo?.title,
            authors: volumeInfo?.authors,
            date: volumeInfo?.publishedDate,
            description: volumeInfo?.description,
            language: volumeInfo?.language,
            thumbnail:
                volumeInfo?.imageLinks?.extraLarge ||
                volumeInfo?.imageLinks?.large ||
                volumeInfo?.imageLinks?.medium
        };
    }

    async fetchFromISBNDB(options: IBookOptions): Promise<IBookInfo> {
        const meta = await isbnDB.find(options.isbn);

        return {
            title: meta?.title_long,
            // no description
            authors: meta?.authors,
            date: meta?.date_published,
            language: meta?.language,
            thumbnail: meta?.image,
        };
    }

    async fetchInfo(options: IBookOptions): Promise<IBookInfo> {
        var bookInfo: IBookInfo = await this.fetchFromGoogle(options);

        const properties = undefinedProperties(bookInfo);
        if (properties.length) {
            const isbnDBMeta = await this.fetchFromISBNDB(options);
            properties.forEach((prop) => {
                bookInfo[prop] = isbnDBMeta[prop];
            })
        }

        this.setCache(options, bookInfo);
        return bookInfo;
    }
}