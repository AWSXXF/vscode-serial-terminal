import * as vscode from 'vscode';
import { SerialPortTerminalManager } from './serialPortTerminalManager';


export function registerContextCallback(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTerminal((terminal) => {
            if (!terminal) {
                return;
            }
            const serialPortTerminal = SerialPortTerminalManager.getInstance().getFromTerminal(terminal);
            if (!serialPortTerminal) {
                setSerialPortTernimalFocus(false);
                return;
            } else {
                setSerialPortTernimalFocus(
                    terminal?.name.match('^PORT: .*') ? true : false
                );
            }

            setSerialPortTernimalRecordingLog(
                serialPortTerminal.isRecording ? true : false
            );
        }));
}

export function setSerialPortTernimalRecordingLog(value: boolean) {
    vscode.commands.executeCommand(
        "setContext",
        "serialTerminal.serialPortTernimalRecordingLog",
        value
    );
}

export function setSerialPortTernimalFocus(value: boolean) {
    vscode.commands.executeCommand(
        "setContext",
        "serialTerminal.serialPortTernimalFocus",
        value
    );
}