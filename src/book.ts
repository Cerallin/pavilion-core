import * as google from '@googleapis/books';
import { MetaManager, IMetaOptions } from './manager';
import axios from '../axios';

axios.defaults.headers.common['Authorization'] = process.env['ISBNDB_API_KEY'];

interface IBookOptions extends IMetaOptions {
    isbn: number
};

interface IBookInfo {
    title?: string;
    authors?: Array<string>;
    publishDate?: string;
    description?: string;
    language?: string;
    thumbnail?: string;
};

interface IISBNDBMeta {
    authors: string[],
    dimensions: string,
    date_published: string,
    binding: string,
    image: string,
    isbn: string,
    isbn13: string,
    isbn10: string,
    language: string,
    msrp: string,
    pages: number,
    publisher: string,
    title: string,
    title_long: string,
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

export default class BookManager extends MetaManager {
    dbFilename: string = "books.json";

    DBPath(): string {
        return this.config.dbPath + '/' + this.dbFilename;
    };

    uniqID(options: IBookOptions): string {
        return '' + options.isbn; // to string
    }

    async fetchFromGoogle(options: IBookOptions): Promise<IBookInfo> {
        const { status, data } = await google.books('v1').volumes.list({
            q: `isbn:${options.isbn}`,
            maxResults: 1,
        })
        if (status !== 200 || !data.totalItems || !data.items?.length) {
            // TODO log
            return {};
        }

        const volumeInfo = data.items[0].volumeInfo || {};
        return {
            title: volumeInfo?.title,
            authors: volumeInfo?.authors,
            publishDate: volumeInfo?.publishedDate,
            description: volumeInfo?.description,
            language: volumeInfo?.language,
            thumbnail:
                volumeInfo?.imageLinks?.extraLarge ||
                volumeInfo?.imageLinks?.large ||
                volumeInfo?.imageLinks?.medium ||
                volumeInfo?.imageLinks?.small ||
                volumeInfo?.imageLinks?.thumbnail ||
                volumeInfo?.imageLinks?.smallThumbnail
        };
    }

    async fetchFromISBNDB(options: IBookOptions): Promise<IBookInfo> {
        const { status, data } = await axios.get('https://api2.isbndb.com/book/' + options.isbn);
        const meta: IISBNDBMeta = data.book;
        return {
            title: meta.title_long,
            // no description
            authors: meta.authors,
            publishDate: meta.date_published,
            language: meta.language,
            thumbnail: meta.image,
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