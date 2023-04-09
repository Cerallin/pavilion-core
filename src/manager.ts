import * as fs from 'fs';
import { logger } from 'hexo-log';

export interface MetaConfig {
    dbPath: string,
    logger?,
};

export interface MetaOption { };

export interface MetaInfo { };

export abstract class MetaManager {
    config: MetaConfig;
    cache: Object = {};

    abstract uniqID(option: MetaOption): string;

    abstract downloadInfo(option: MetaOption): Promise<MetaInfo>;

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
    fetchInfo(option: MetaOption): MetaInfo | {} {
        if (!this.inCache(option)) { // check cache first
            const filename = this.DBPath();
            if (fs.existsSync(filename)) { // or load from file
                this.cache = this.loadFile(filename);
            }
        }
        if (!this.inCache(option)) // no existence
            return {};
        return this.fetchCache(option);
    }

    abstract DBPath(): string;

    save() {
        fs.writeFileSync(this.DBPath(), JSON.stringify(this.cache));
    }


    inCache(option: MetaOption): boolean {
        return this.cache && this.uniqID(option) in this.cache;
    }

    setCache(option: MetaOption, metaInfo: MetaInfo) {
        this.cache[this.uniqID(option)] = metaInfo;
    }

    fetchCache(option: MetaOption): MetaInfo {
        return this.cache[this.uniqID(option)];
    }
}