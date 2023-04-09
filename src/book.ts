import { books } from '@googleapis/books';
import { MetaManager, MetaOption } from '../types';

// using isbn as uniqID
interface BookOption extends MetaOption { }

interface BookInfo {
    title?: string;
    authors?: Array<string>;
    publishDate?: string;
    description?: string;
    language?: string;
    thumbnail?: string;
}

export default class BookManager extends MetaManager {
    async downloadInfo(option: BookOption): Promise<BookInfo> {
        const { status, data } = await books('v1').volumes.list({
            q: `isbn:${option.uniqID}`,
            maxResults: 1,
        })
        if (status !== 200 || !data.totalItems || !data.items?.length)
            return {};
        else {
            const volumeInfo = data.items[0].volumeInfo;
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
    }
}