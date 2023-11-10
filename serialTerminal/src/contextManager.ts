import * as vscode from 'vscode';
import { serialPortTerminalManager } from './serialPortTerminalManager';
import { isSerialPortTerminal } from './serialPortTerminal';

function registerContextCallback(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTerminal((terminal) => {
            if (!terminal) {
                return;
            }
            const serialPortTerminal = serialPortTerminalManager.getFromTerminal(terminal);
            if (!serialPortTerminal) {
                setSerialPortTernimalFocus(false);
                return;
            } else {
                setSerialPortTernimalFocus(
                    (terminal) && isSerialPortTerminal(terminal.name)
                );
            }

            setSerialPortTernimalRecordingLog(serialPortTerminal.state.loging);
        }));
}

function setSerialPortTernimalRecordingLog(value: boolean) {
    vscode.commands.executeCommand(
        "setContext",
        "serialTerminal.serialPortTernimalRecordingLog",
        value
    );
}

function setSerialPortTernimalFocus(value: boolean) {
    vscode.commands.executeCommand(
        "setContext",
        "serialTerminal.serialPortTernimalFocus",
        value
    );
}

export { registerContextCallback, setSerialPortTernimalRecordingLog };