import { Notification, BrowserWindow } from 'electron'

export enum LogLevel {
    Verbose, Info, Success, Warning, Exception, Failure
}

class LogService {
    private static instance: LogService;
    private ReadyForNotifications = false;
    public win: BrowserWindow;

    constructor() {
        this.log(LogLevel.Info, 'Created new instance of LogService');
    }

    public static getInstance(): LogService {
        if (!LogService.instance) {
            LogService.instance = new LogService();
        }
        return LogService.instance;
    }

    public setReadyForNotifications() {
        this.ReadyForNotifications = true;
    }

    public log(level: LogLevel, message: string, className?: string, methodName?: string) {
        let logMessage = message;

        switch (level) {
            case LogLevel.Verbose:
                logMessage = `Verbose: ${logMessage}`
                break;
            case LogLevel.Info:
                logMessage = `Info: ${logMessage}`
                break;
            case LogLevel.Success:
                logMessage = `Success: ${logMessage}`
                break;
            case LogLevel.Warning:
                logMessage = `Warning: ${logMessage}`
                break;
            case LogLevel.Exception:
                logMessage = `Exception: ${logMessage}`
                break;
            case LogLevel.Failure:
                logMessage = `Failure: ${logMessage}`
                break;
        }

        // Constrain log messages to 64 characters
        const maxLogLengthChars = 128;
        if (logMessage.length > maxLogLengthChars) {
            logMessage = `${logMessage.substring(0, maxLogLengthChars)}[...]`;
        }

        logMessage = `[${className}] [${methodName}] ${logMessage}`;

        if (this.win) {
            this.win.webContents.send('log', logMessage);
            console.log(message);
        } else {
            logMessage = `log: win not ready: ${logMessage}`
            console.log(logMessage);
        }
    }

    public notify(data: string) {
        if (this.win) {
            new Notification({
                title: 'Notification',
                body: data
            }).show()
        } else {
            console.log("notify: win not ready")
        }
    }
}

export default LogService.getInstance();