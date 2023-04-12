import axios from "../axios";

function axiosInstance() {
    const instance = axios();
    instance.defaults.headers.common['Authorization'] = process.env.ISBNDB_API_KEY;

    return instance;
}


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

export async function find(isbn: number): Promise<IISBNDBMeta> {
    const { data } = await axiosInstance()
        .get('https://api2.isbndb.com/book/' + isbn);
    const meta: IISBNDBMeta = data.book;

    return meta;
}