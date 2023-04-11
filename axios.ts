import axios from 'axios';
import { name, version } from './package.json';

axios.defaults.headers.common['User-Agent'] = `${name}/${version}`;

export default axios;
