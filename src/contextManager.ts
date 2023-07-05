import * as vscode from 'vscode';
import { getSerialPortTerminalFrom } from './terminalManager';


export function registerContextCallback() {
    vscode.window.onDidChangeActiveTerminal((terminal) => {
        if (!terminal) {
            return;
        }

        const serialPortTerminal = getSerialPortTerminalFrom(terminal);

        if (!serialPortTerminal) {
            return;
        } else {
            setSerialPortTernimalFocus(
                terminal?.name.match('^PORT: .*') ? true : false
            );
        }

        setSerialPortTernimalRecordingLog(
            serialPortTerminal.isRecordingLog() ? true : false
        );
    });
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