import * as vscode from 'vscode';
import * as colors from 'colors';
import * as fs from 'fs';

import { l10n } from "vscode";
import { SerialPort } from 'serialport';
import { getLogUri } from './settingManager';
import { updateLogProvider } from './logManager';
import { updateSerialPortProvider } from './serialPortManager';
import { ISerialPortTerminal, SerialPortTerminal } from './serialPortTerminal';

interface ISerialPortTerminalManager {
    getInstance(): ISerialPortTerminalManager;
    showSerialPortTerminal(portPath: string, baudRate: number, closeCallback?: () => void): void;
    getFromTerminal(terminal: vscode.Terminal): ISerialPortTerminal | undefined;
    getFromPortPath(portName: string): ISerialPortTerminal | undefined;
    remove(terminalName: string): boolean;
}


export class SerialPortTerminalManager implements ISerialPortTerminalManager {
    private serialPortTerminals = new Map<string, ISerialPortTerminal>();
    private static instance: ISerialPortTerminalManager;
    private constructor() { }
    getInstance(): ISerialPortTerminalManager {
        return SerialPortTerminalManager.getInstance();
    }
    static getInstance(): ISerialPortTerminalManager {
        if (!this.instance) {
            this.instance = new SerialPortTerminalManager();
        }
        return this.instance;
    }

    showSerialPortTerminal(portPath: string, baudRate: number, closeCallback?: (() => void) | undefined): void {
        var exist = this.getFromPortPath(portPath);
        if (exist) {
            if (exist.baudRate !== baudRate) {
                exist.setBaudRate(baudRate);
            }
            if (!exist.isOpen) {
                exist.reOpen();
            }
            exist.show();
        } else {
            var serialTerminal = new SerialPortTerminal(portPath, baudRate, () => {
                this.remove(`PORT: ${portPath}`);
            });
            this.serialPortTerminals.set(serialTerminal.terminalName, serialTerminal);
        }
    }
    getFromTerminal(terminal: vscode.Terminal): ISerialPortTerminal | undefined {
        return this.serialPortTerminals.get(terminal.name);
    }
    getFromPortPath(portPath: string): ISerialPortTerminal | undefined {
        return this.serialPortTerminals.get(`PORT: ${portPath}`);
    }
    remove(terminalName: string): boolean {
        return this.serialPortTerminals.delete(terminalName);
    }
}