import * as vscode from 'vscode';
import * as colors from 'colors';
import * as fs from 'fs';

import { l10n } from "vscode";
import { SerialPort } from 'serialport';
import { getLogUri } from './settingManager';

class SerialPortTerminal {
    portName: string;
    terminalName: string;

    private writeEmitter: vscode.EventEmitter<string>;
    private port: SerialPort;
    private terminal: vscode.Terminal;

    private active: boolean;
    private recordingLog: boolean;
    private recordingListener: (data: any) => void;
    private logPath: vscode.Uri | undefined;

    async startSave(): Promise<boolean> {
        if (this.recordingLog) {
            return false;
        }

        const fileName = await vscode.window.showInputBox({
            title: "input log file name",
            value: "normal_" + new Date().toLocaleString('zh', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }).replace(/[\/:]/g, '').replace(/ /g, '_'),
            valueSelection: [0, 6],
            prompt: "Only letters, numbers, `_` and `-` are allowed",
            placeHolder: "placeHolder",
            validateInput: (value: string) => {
                const result = value.match(/^[0-9a-zA-Z_-]*$/g)?.toString();
                console.log({ result });
                return result ? undefined : "Only letters, numbers, `_` and `-` are allowed";
            }
        });

        console.log(fileName);

        if (!fileName) {
            return false;
        }

        const filePath = vscode.Uri.joinPath(getLogUri(), fileName);
        fs.writeFileSync(filePath.fsPath, "");

        this.logPath = filePath;
        this.recordingLog = true;
        this.recordingListener = (data) => {
            console.log(data.toString());
            fs.appendFileSync(filePath.fsPath, data.toString());
        };
        this.port.addListener("data", this.recordingListener);

        return true;
    }

    stopSave(): boolean {
        if (this.recordingLog) {
            this.port.removeListener("data", this.recordingListener);
            this.recordingLog = false;
            vscode.window.showInformationMessage("log save at " + this.logPath?.fsPath);
            return true;
        } else {
            return false;
        }
    }

    send(chunk: any, encoding?: BufferEncoding, cb?: (error: Error | null | undefined) => void): boolean {
        return this.port.write(chunk, encoding, cb);
    }

    show() {
        this.terminal.show();
    }

    isRunning(): boolean {
        return this.active;
    }

    isRecordingLog(): boolean {
        return this.recordingLog;
    }

    constructor(portOpened: SerialPort) {
        this.port = portOpened;
        this.active = false;
        this.portName = this.port.path;
        this.terminalName = `PORT: ${this.portName}`;
        this.writeEmitter = new vscode.EventEmitter<string>();

        const pty: vscode.Pseudoterminal = {
            onDidWrite: this.writeEmitter.event,
            open: () => {
                if (this.port.isOpen) {
                    this.active = true;
                    this.writeEmitter.fire(colors.green.bold(l10n.t('({0}) CONNECTED\r\n\r\n', this.port.path)));
                } else {
                    this.active = false;
                    this.writeEmitter.fire(colors.red.bold(l10n.t('({0}) OPEN FAILED! \r\n\r\n', this.port.path)));
                }
            },
            close: () => {
                this.port.close();
                this.active = false;
            },
            handleInput: (data) => {
                this.port.write(data);
            }
        };

        this.port.addListener("data", (data) => {
            this.writeEmitter.fire(data.toString());
        });

        this.port.on("close", () => {
            this.writeEmitter.fire(colors.red.bold(l10n.t("({0}) CLOSED! \r\n\r\n", this.port.path)));
            removeSerialTerminal(this.terminalName);
            this.active = false;
        });

        this.terminal = vscode.window.createTerminal({ name: this.terminalName, pty: pty });
        this.recordingLog = false;
        this.recordingListener = () => { };
        this.logPath = undefined;

        this.terminal.show();
    }
}


const serialPortTerminals = new Map<string, SerialPortTerminal>();

export function getSerialPortTerminalFromTerminal(terminal: vscode.Terminal): SerialPortTerminal | undefined {
    return serialPortTerminals.get(terminal.name);
}

export function getSerialPortTerminalFromPortName(portName: string): SerialPortTerminal | undefined {
    return serialPortTerminals.get(`PORT: ${portName}`);
}

export function addSerialTerminal(portOpened: SerialPort) {
    const serialTerminal = new SerialPortTerminal(portOpened);
    serialPortTerminals.set(serialTerminal.terminalName, serialTerminal);
}

export function removeSerialTerminal(terminalName: string) {
    serialPortTerminals.delete(terminalName);
}

