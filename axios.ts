import axios from 'axios';

const package_name = process.env.npm_package_name;
const package_version = process.env.npm_package_version;

export default function() {
    return axios.create({
        headers: { "User-Agent": `${package_name}/${package_version}` },
    });
}
