import * as fs from 'fs';

export interface MetaConfig {
    dbPath: string
}

export interface MetaOption {
    uniqID: string
}

export interface MetaInfo {}

export abstract class MetaManager {
    config: MetaConfig;

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

    async fetchInfo(option: MetaOption): Promise<MetaInfo> {
        const filename = `${this.config.dbPath}/${option.uniqID}.json`;
        var info;
        if (fs.existsSync(filename)) {
            info = this.loadFile(filename);
        }
        else {
            // wait for response
            info = await this.downloadInfo(option);
            // didn't wait
            fs.promises.writeFile(filename, JSON.stringify(info));
            return info;
        }
    }

    abstract downloadInfo(option: MetaOption): Promise<MetaInfo>;
}