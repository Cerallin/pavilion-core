import * as fs from 'fs';
import { logger } from 'hexo-log';

export interface IMetaConfig {
    dbPath: string,
    logger?,
};

export interface IMetaOptions { };

export interface IMetaInfo {
    title?: string,
    language?: string,
    date?: string,
};

export abstract class AbstractManager {
    config: IMetaConfig;
    cache: Object = {};

    abstract uniqID(options: IMetaOptions): string;

    abstract fetchInfo(options: IMetaOptions): Promise<IMetaInfo>;

    constructor(config: IMetaConfig) {
        this.config = config;
        // check if dbPath exists
        if (!fs.existsSync(config.dbPath)) {
            fs.mkdirSync(config.dbPath, { recursive: true });
        }
    }

    loadFile(filename: string) {
        return fs.existsSync(filename) ?
            JSON.parse(fs.readFileSync(filename, 'utf-8')) : {};
    }

    // Get cached or stored meta info.
    cachedInfo(options: IMetaOptions): IMetaInfo {
        if (!Object.keys(this.cache).length) { // check cache first
            const filename = this.DBPath();
            if (fs.existsSync(filename)) { // or load from file
                this.cache = this.loadFile(filename);
            }
        }
        if (!this.inCache(options)) // no existence
            return {};
        return this.fetchCache(options);
    }

    async get(options: IMetaOptions): Promise<IMetaInfo & { cached: boolean }> {
        function isEmpty(obj: Object) { return Object.keys(obj).length === 0; }
        function merge(...objList: Object[]) { return Object.assign({}, ...objList); }

        const metaInfo = this.cachedInfo(options);
        const cache = merge(metaInfo, { cached: true });
        if (!isEmpty(metaInfo))
            return cache;
        return merge(await this.fetchInfo(options), { cached: false });
    }

    abstract DBPath(): string;

    save() {
        fs.writeFileSync(this.DBPath(), JSON.stringify(this.cache));
    }

    inCache(options: IMetaOptions): boolean {
        return this.cache && this.uniqID(options) in this.cache;
    }

    setCache(options: IMetaOptions, metaInfo: IMetaInfo) {
        this.cache[this.uniqID(options)] = metaInfo;
    }

    fetchCache(options: IMetaOptions): IMetaInfo {
        return this.cache[this.uniqID(options)];
    }
}