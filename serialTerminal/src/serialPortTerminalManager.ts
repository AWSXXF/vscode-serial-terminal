import * as vscode from 'vscode';
import { ISerialPortTerminal, SerialPortConfiguration, SerialPortTerminal, terminalNamePrefix } from './serialPortTerminal';
import { TerminalProfile } from 'vscode';

const serialPortTerminalManager = new (class {
    private serialPortTerminals = new Map<string, ISerialPortTerminal>();
    async showSerialPortTerminal(portPath: string, cfg: SerialPortConfiguration, closeCallback?: () => void): Promise<void> {
        var exist = this.getFromPortPath(portPath);
        if (exist) {
            /* Actually, the whole OPTION should be judged here, but the only interface parameter for update is baudrate, so that's it! */
            if (exist.serialport.baudRate !== cfg.baudrate) {
                exist.serialport.update({ baudRate: cfg.baudrate });
            }
            if (!exist.serialport.isOpen) {
                exist.open();
            }
            exist.terminal.show();
        } else {
            var serialPortTerminal = await SerialPortTerminal.new(portPath, cfg);
            serialPortTerminal.setCloseCallback(() => {
                this.remove(serialPortTerminal.terminal.name);
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