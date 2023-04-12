import axios from 'axios';
import { name, version } from './package.json';

export default function() {
    return axios.create({
        headers: { "User-Agent": `${name}/${version}` },
    });
}
