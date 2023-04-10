import * as fs from 'fs';
import { logger } from 'hexo-log';

export interface MetaConfig {
    dbPath: string,
    logger?,
};

export interface MetaOptions { };

export interface MetaInfo { };

export abstract class MetaManager {
    config: MetaConfig;
    cache: Object = {};

    abstract uniqID(options: MetaOptions): string;

    abstract fetchInfo(options: MetaOptions): Promise<MetaInfo>;

    constructor(config: MetaConfig) {
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
    cachedInfo(options: MetaOptions): MetaInfo {
        if (!this.inCache(options)) { // check cache first
            const filename = this.DBPath();
            if (fs.existsSync(filename)) { // or load from file
                this.cache = this.loadFile(filename);
            }
        }
        if (!this.inCache(options)) // no existence
            return {};
        return this.fetchCache(options);
    }

    async get(options: MetaOptions): Promise<MetaInfo> {
        function isEmpty(obj: Object) { return Object.keys(obj).length === 0; }
        function merge(...objList: Object[]) { return Object.assign({}, ...objList); }

        const cache = merge(this.cachedInfo(options), { cached: true });
        if (!isEmpty(cache))
            return cache;
        return merge(await this.fetchInfo(options), { cached: false });
    }

    abstract DBPath(): string;

    save() {
        fs.writeFileSync(this.DBPath(), JSON.stringify(this.cache));
    }


    inCache(options: MetaOptions): boolean {
        return this.cache && this.uniqID(options) in this.cache;
    }

    setCache(options: MetaOptions, metaInfo: MetaInfo) {
        this.cache[this.uniqID(options)] = metaInfo;
    }

    fetchCache(options: MetaOptions): MetaInfo {
        return this.cache[this.uniqID(options)];
    }
}