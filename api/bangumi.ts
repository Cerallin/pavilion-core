import axios from '../axios'

function axiosInstance() {
    const instance = axios();
    instance.defaults.baseURL = 'https://api.bgm.tv';
    instance.defaults.params = {
        client_id: process.env.BANGUMI_API_KEY,
    };

    return instance;
}

interface IBangumiSubject {
    id?: number
    type?: number
    name?: string
    name_cn?: string
    summary?: string
    nsfw?: boolean
    locked?: boolean
    date?: string
    platform?: string
    images?: {
        large?: string
        common?: string
        medium?: string
        small?: string
        grid?: string
    }

    infobox?: {
        key?: string
        value?: string | { v: string }[]
    }[]

    volumes?: number
    eps?: number
    total_episodes?: number
    rating?: {
        rank?: number
        total?: number
        count?: {
            1: number
            2: number
            3: number
            4: number
            5: number
            6: number
            7: number
            8: number
            9: number
            10: number
        }
        score?: number
    }
    collection?: {
        wish?: number
        collect?: number
        doing?: number
        on_hold?: number
        dropped?: number
    }
    tags?: {
        name?: string
        count?: number
    }[]
}

export async function getSubject(id: number): Promise<IBangumiSubject> {
    const { data } = await axiosInstance().get('/v0/subjects/' + id);

    return data;
}
