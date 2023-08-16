import * as vscode from 'vscode';
import * as colors from 'colors';
import * as fs from 'fs';
import { ExtensionTerminalOptions, l10n } from 'vscode';
import { SerialPort } from 'serialport';

import { getLogUri } from './settingManager';

export interface ISerialPortTerminal {
    get portPath(): string;
    get baudRate(): number;
    get terminalName(): string;
    get isRecording(): boolean;
    get isOpen(): boolean;
    setBaudRate(baudRate: number): void;
    send(chunk: any, encoding?: BufferEncoding): boolean;
    show(): void;
    reOpen(): void;
    startSaveLog(callback?: () => void): Promise<boolean>;
    stopSave(): boolean;
}

export class SerialPortTerminal implements ISerialPortTerminal {
    private opts: ExtensionTerminalOptions;
    private port: SerialPort;
    private terminal: vscode.Terminal | undefined;
    private writeEmitter: vscode.EventEmitter<string>;
    private recording: boolean;
    private logPath: vscode.Uri;
    private recordCallback: (data: any) => void;

    get portPath() {
        return this.port.path;
    }

    get baudRate(): number {
        return this.port.baudRate;
    }

    get terminalName() {
        var name = this.terminal?.name;
        return name ? name : "";
    }

    get isRecording() {
        return this.recording;
    }

    get isOpen() {
        return this.port.isOpen;
    }

    constructor(portPath: string, baudRate: number, closeCallBack?: () => void) {
        var noticeMessage: string;

        this.recording = false;
        this.logPath = vscode.Uri.file("");
        this.recordCallback = () => { };
        this.writeEmitter = new vscode.EventEmitter<string>();
        this.port = new SerialPort({ path: portPath, baudRate: baudRate }, () => {
            noticeMessage = this.port.isOpen ?
                colors.green.bold(l10n.t('({0}) CONNECTED\r\n\r\n', this.port.path))
                : colors.red.bold(l10n.t('({0}) OPEN FAILED! \r\n\r\n', this.port.path));
        });
        this.port.addListener("data", (data) => {
            this.writeEmitter.fire(data.toString());
        });
        this.port.on("close", () => {
            this.writeEmitter.fire(colors.red.bold(l10n.t("({0}) CLOSED! \r\n\r\n", this.port.path)));
        });

        this.opts = {
            pty: {
                onDidWrite: this.writeEmitter.event,
                open: () => {
                    this.writeEmitter.fire(noticeMessage);
                },
                close: () => {
                    this.port.close();
                    if (closeCallBack) {
                        closeCallBack();
                    };
                },
                handleInput: (data) => {
                    this.port.write(data);
                }
            },
            name: `PORT: ${portPath}`
        };
        this.terminal = vscode.window.createTerminal(this.opts);
        this.terminal.show();
    }

    setBaudRate(baudRate: number): void {
        this.port.update({ baudRate: baudRate });
    }

    show(): void {
        this.terminal?.show();
    }

    send(chunk: any, encoding?: BufferEncoding | undefined): boolean {
        return this.port.write(chunk, encoding);
    }

    reOpen(): void {
        this.port.open(() => {
            this.writeEmitter.fire(
                this.port.isOpen ?
                    colors.green.bold(l10n.t('({0}) CONNECTED\r\n\r\n', this.port.path))
                    : colors.red.bold(l10n.t('({0}) OPEN FAILED! \r\n\r\n', this.port.path))
            );
        });
    }

    async startSaveLog(callback?: () => void): Promise<boolean> {
        if (this.isRecording) {
            return false;
        }
        const fileName = await vscode.window.showInputBox({
            title: l10n.t("Please enter the log file name"),
            value: "general_" + new Date().toLocaleString('zh', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }).replace(/[\/:]/g, '').replace(/ /g, '_'),
            valueSelection: [0, 7],
            prompt: l10n.t("Only letters, numbers, `_` and `-` are allowed"),
            validateInput: (value: string) => {
                const result = value.match(/^[0-9a-zA-Z_-]*$/g)?.toString();
                return result ? undefined : l10n.t("Only letters, numbers, `_` and `-` are allowed");
            }
        });
        if (!fileName) {
            return false;
        }
        this.logPath = vscode.Uri.joinPath(getLogUri(), fileName + ".log");
        this.recording = true;

        fs.writeFileSync(this.logPath.fsPath, "");
        this.recordCallback = (data) => {
            fs.appendFileSync(this.logPath.fsPath, data.toString().replace('\r', ''));
        };
        this.port.addListener("data", this.recordCallback);
        if (callback) {
            callback();
        }
        return true;
    }

    stopSave(): boolean {
        if (this.isRecording) {
            this.port.removeListener("data", this.recordCallback);
            this.recording = false;
            vscode.window.showInformationMessage(l10n.t("The logs have been saved in {0}", this.logPath?.fsPath));
            return true;
        }
        return false;
    }
}