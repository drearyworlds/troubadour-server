import { Notification, BrowserWindow } from 'electron'

export enum LogLevel {
    Verbose, Info, Success, Warning, Failure
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
        if (this.win) {
            this.win.webContents.send('log', message);
            console.log(message);
        } else {
            console.log("log: win not ready")
            console.log(message);
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