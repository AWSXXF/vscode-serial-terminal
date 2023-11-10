import * as vscode from 'vscode';
import { ISerialPortTerminal, SerialPortTerminal, terminalNamePrefix } from './serialPortTerminal';
import { TerminalProfile } from 'vscode';

const serialPortTerminalManager = new (class {
    private serialPortTerminals = new Map<string, ISerialPortTerminal>();
    async showSerialPortTerminal(portPath: string, baudRate: number, closeCallback?: () => void): Promise<void> {
        var exist = this.getFromPortPath(portPath);
        if (exist) {
            if (exist.serialport.baudRate !== baudRate) {
                exist.serialport.update({ baudRate: baudRate });
            }
            if (!exist.serialport.isOpen) {
                exist.open();
            }
            exist.terminal.show();
        } else {
            var serialPortTerminal = await SerialPortTerminal.new(portPath, baudRate);
            serialPortTerminal.setCloseCallback(() => {
                return this.remove(portPath);
            });
            this.serialPortTerminals.set(serialPortTerminal.terminal.name, serialPortTerminal);
            serialPortTerminal.terminal.show();
        }
    }

    getSerialPortTerminalProfile(): Promise<TerminalProfile> {
        return new Promise<TerminalProfile>(async (resolve, reject) => {
            const serialPortTerminal = await SerialPortTerminal.newOpt();
            const opts = serialPortTerminal.terminal.options;
            if (opts) {
                this.serialPortTerminals.set(serialPortTerminal.terminal.name, serialPortTerminal);
                serialPortTerminal.setCloseCallback(() => {
                    this.remove(serialPortTerminal.terminal.name);
                });
                resolve(new TerminalProfile(opts));
            } else {
                reject();
            }
        });
    }

    getFromTerminal(terminal: vscode.Terminal): ISerialPortTerminal | undefined {
        return this.serialPortTerminals.get(terminal.name);
    }

    getFromPortPath(portPath: string): ISerialPortTerminal | undefined {
        return this.serialPortTerminals.get(terminalNamePrefix + portPath);
    }

    remove(terminalName: string): boolean {
        return this.serialPortTerminals.delete(terminalName);
    }
})();

export { serialPortTerminalManager };