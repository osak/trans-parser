export class Logger {
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

export enum LogLevel {
    FATAL = 0,
    WARN = 1,
    INFO = 2,
    TRACE = 3,
}


export const logger = new Logger(LogLevel.FATAL);