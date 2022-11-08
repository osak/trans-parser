import * as fsPromises from 'fs/promises';
import { Row, Trans } from './types';
import { ArgumentParser } from 'argparse';
import { deserializeRows, serializeRows } from './serde';
import { applyTranslations } from './trans';

interface Arguments {
    command: 'export' | 'import';
    transFile: string;
    csvFile: string;
    outputTransFile: string | null;
    verbose: number;
}

enum LogLevel {
    FATAL = 0,
    WARN = 1,
    INFO = 2,
    TRACE = 3,
}

class Logger {
    constructor(private verbosity: number) {}

    log(level: LogLevel, text: string) {
        if (this.verbosity >= level) {
            console.log(text);
        }
    }

    fatal(text: string) {
        this.log(LogLevel.FATAL, text);
    }

    warn(text: string) {
        this.log(LogLevel.WARN, text);
    }

    info(text: string) {
        this.log(LogLevel.INFO, text);
    }

    trace(text: string) {
        this.log(LogLevel.TRACE, text);
    }

    setVerbosity(level: LogLevel) {
        this.verbosity = level;
    }
}

const logger = new Logger(LogLevel.FATAL);

async function loadTransFile(path: string): Promise<Trans> {
    logger.trace('loadTransFile');

    logger.info(`Reading trans file: ${path}`);
    const content = await fsPromises.readFile(path);

    logger.info('Parsing trans file');
    return JSON.parse(content.toString());
}

async function doExport(args: Arguments) {
    logger.trace('doExport');

    const trans = await loadTransFile(args.transFile);
    
    logger.info('Collecting rows');
    const rows = [] as Row[];
    for (const fileTag of Object.keys(trans.project.files)) {
        logger.trace(`Loading ${fileTag}`)
        const transFile = trans.project.files[fileTag];
        for (let i = 0; i < transFile.data.length; ++i) {
            logger.trace(`Loading ${fileTag}/${i}`);
            const original = transFile.data[i][0];
            const initial = transFile.data[i][1];
            if (original == null) {
                continue;
            }

            for (let j = 0; j < transFile.context[i].length; ++j) {
                const context = transFile.context[i][j];
                const params = transFile.parameters[i];
                let graphic = "";
                if (params != null && params[j] != null) {
                    graphic = JSON.stringify(params[j].p);
                }
                rows.push(new Row(fileTag, context, original, graphic, initial));
            }
        }
    }
    logger.info(`Collected ${rows.length} rows`);

    logger.info(`Serializing rows`);
    const serialized = serializeRows(rows);

    logger.info(`Writing serialized data as ${args.csvFile}`);
    await fsPromises.writeFile(args.csvFile, serialized);
}

async function doImport(args: Arguments) {
    logger.trace('doImport');

    if (args.outputTransFile == null) {
        throw new Error('--outputTransFile must be specified');
    }

    const trans = await loadTransFile(args.transFile);

    logger.info(`Reading csv file: ${args.csvFile}`);
    const csvContent = await fsPromises.readFile(args.csvFile);

    logger.info(`Parsing csv file`);
    const rows = deserializeRows(csvContent.toString());

    logger.info('Applying translations');
    applyTranslations(trans, rows);

    logger.info(`Writing out to ${args.outputTransFile}`);
    await fsPromises.writeFile(args.outputTransFile, JSON.stringify(trans));
}

async function main() {
    const parser = new ArgumentParser();
    parser.add_argument('command', {type: String, choices:['export', 'import'], help: 'select command'});
    parser.add_argument('--transFile', {type: String, help: 'path to the input .trans file', required: true});
    parser.add_argument('--csvFile', {type: String, help: 'path to the .csv file', required: true});
    parser.add_argument('--outputTransFile', {type: String, help: 'path to the output .trans file', required: false});
    parser.add_argument('--verbose', {type: 'int', nargs: '?', const: 2, default: 0, help: 'verbosity'});
    const args: Arguments = parser.parse_args();

    logger.setVerbosity(args.verbose);

    switch (args.command) {
        case 'export':
            doExport(args);
            break;
        case 'import':
            doImport(args);
            break;
    }
}

main();