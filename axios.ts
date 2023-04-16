import { package_name, package_version } from './ua';
import axios from 'axios';

export default function () {
    console.log(process.env);
    return axios.create({
        headers: { "User-Agent": `${package_name}/${package_version}` },
    });
}
