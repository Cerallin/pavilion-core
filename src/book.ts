import * as google from '@googleapis/books';
import { MetaManager, MetaOptions } from './manager';

interface BookOptions extends MetaOptions {
    isbn: number
}

interface BookInfo {
    title?: string;
    authors?: Array<string>;
    publishDate?: string;
    description?: string;
    language?: string;
    thumbnail?: string;
}

export default class BookManager extends MetaManager {
    dbFilename: string = "books.json";

    DBPath(): string {
        return this.config.dbPath + '/' + this.dbFilename;
    };

    uniqID(options: BookOptions): string {
        return '' + options.isbn; // to string
    }

    async fetchInfo(options: BookOptions): Promise<BookInfo> {
        const { status, data } = await google.books('v1').volumes.list({
            q: `isbn:${options.isbn}`,
            maxResults: 1,
        })
        if (status !== 200 || !data.totalItems || !data.items?.length)
            return {};
        else {
            const volumeInfo = data.items[0].volumeInfo;
            const bookInfo = {
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
            this.setCache(options, bookInfo);
            return bookInfo;
        }
    }
}