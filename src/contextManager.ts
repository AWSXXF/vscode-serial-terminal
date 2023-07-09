import * as vscode from 'vscode';
import { getSerialPortTerminalFromTerminal } from './terminalManager';


export function registerContextCallback() {
    vscode.window.onDidChangeActiveTerminal((terminal) => {
        if (!terminal) {
            return;
        }
        const serialPortTerminal = getSerialPortTerminalFromTerminal(terminal);
        if (!serialPortTerminal) {
            setSerialPortTernimalFocus(false);
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