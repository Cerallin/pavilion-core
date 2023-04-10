import * as google from '@googleapis/books';
import { MetaManager, MetaOption } from './manager';

interface BookOption extends MetaOption {
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

    uniqID(option: BookOption): string {
        return '' + option.isbn; // to string
    }

    async fetchInfo(option: BookOption): Promise<BookInfo> {
        const { status, data } = await google.books('v1').volumes.list({
            q: `isbn:${option.isbn}`,
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
            this.setCache(option, bookInfo);
            return bookInfo;
        }
    }
}