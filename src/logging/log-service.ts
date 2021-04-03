import { Notification, BrowserWindow } from 'electron'

class LogService {
    private static instance: LogService;
    private ReadyForNotifications = false;
    public win: BrowserWindow;

    constructor() {
        this.log('Created new instance of LogService');
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

    public log(data: string) {
        if (this.win) {
            this.win.webContents.send('log', data);
        } else {
            console.log("log: win not ready")
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