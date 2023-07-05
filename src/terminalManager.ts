import * as vscode from 'vscode';
import * as colors from 'colors';
import * as fs from 'fs';

import { l10n } from "vscode";
import { SerialPort } from 'serialport';

class SerialPortTerminal {
    portName: string;
    terminalName: string;

    private writeEmitter: vscode.EventEmitter<string>;
    private port: SerialPort;
    private terminal: vscode.Terminal;

    private recordingLog: boolean;
    private recordingListener: (data: any) => void;
    private logPath: string | undefined;

    async startSave(): Promise<boolean> {
        if (this.recordingLog) {
            return false;
        }

        const fileUri = await vscode.window.showSaveDialog({
            filters: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "LOG": [".log"],
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "TXT": [".txt"],
            }
        });

        if (!fileUri) {
            return false;
        }

        const filePath = fileUri.fsPath;
        fs.writeFileSync(filePath, "");

        this.logPath = filePath;
        this.recordingLog = true;
        this.recordingListener = (data) => {
            fs.appendFileSync(filePath, data);
            this.writeEmitter.fire(data.toString());
        };
        this.port.addListener("data", this.recordingListener);

        return true;
    }

    stopSave(): boolean {
        if (this.recordingLog) {
            this.port.removeListener("data", this.recordingListener);
            this.recordingLog = false;
            vscode.window.showInformationMessage("log save at " + this.logPath);
            return true;
        } else {
            return false;
        }
    }

    send(chunk: any, encoding?: BufferEncoding, cb?: (error: Error | null | undefined) => void): boolean {
        return this.port.write(chunk, encoding, cb);
    }

    isRecordingLog(): boolean {
        return this.recordingLog;
    }

    constructor(portOpened: SerialPort) {
        this.port = portOpened;
        this.portName = this.port.path;
        this.terminalName = `PORT: ${this.portName}`;
        this.writeEmitter = new vscode.EventEmitter<string>();

        const pty: vscode.Pseudoterminal = {
            onDidWrite: this.writeEmitter.event,
            open: () => {
                if (this.port.isOpen) {
                    this.writeEmitter.fire(colors.green.bold(l10n.t('({0}) CONNECTED\r\n\r\n', this.port.path)));
                } else {
                    this.writeEmitter.fire(colors.red.bold(l10n.t('({0}) OPEN FAILED! \r\n\r\n', this.port.path)));
                }
            },
            close: () => {
                this.port.close();
                removeSerialTerminal(this.terminalName);
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
        });

        this.terminal = vscode.window.createTerminal({ name: this.terminalName, pty: pty });
        this.recordingLog = false;
        this.recordingListener = () => { };
        this.logPath = undefined;

        this.terminal.show();
    }
}


const serialPortTerminals = new Map<string, SerialPortTerminal>();

export function getSerialPortTerminalFrom(terminal: vscode.Terminal | undefined): SerialPortTerminal | undefined {
    if (terminal) {
        return serialPortTerminals.get(terminal.name);
    } else {
        return undefined;
    }

}

export function addSerialTerminal(portOpened: SerialPort) {
    const serialTerminal = new SerialPortTerminal(portOpened);
    serialPortTerminals.set(serialTerminal.terminalName, serialTerminal);
}

export function removeSerialTerminal(terminalName: string) {
    serialPortTerminals.delete(terminalName);
}

