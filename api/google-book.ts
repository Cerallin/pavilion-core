import * as google from '@googleapis/books';

export async function search(isbn:number) {
    const { data } = await google.books('v1').volumes.list({
        q: `isbn:${isbn}`,
        maxResults: 1,
    })
    if (!data.totalItems || !data.items?.length) {
        // TODO log error
        return {};
    }

    return data.items[0].volumeInfo || {};
}
