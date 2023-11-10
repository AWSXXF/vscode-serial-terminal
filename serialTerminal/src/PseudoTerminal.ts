import * as vscode from 'vscode';
import { EventEmitter, ExtensionTerminalOptions, Terminal, TerminalDimensions, TerminalEditorLocationOptions, TerminalLocation, TerminalSplitLocationOptions, ThemeColor, ThemeIcon, Uri, window } from "vscode";

interface PseudoTerminalOptions {
    create?: boolean;
    iconPath?: Uri | { light: Uri; dark: Uri } | ThemeIcon,
    color?: ThemeColor,
    location?: TerminalLocation | TerminalEditorLocationOptions | TerminalSplitLocationOptions,
    isTransient?: boolean
}

class PseudoTerminal {
    private writeEmitter = new EventEmitter<string>;
    private overrideDimensionsEmitter = new EventEmitter<TerminalDimensions | undefined>;
    private closeEmitter = new EventEmitter<void | number>;
    private changeNameEmitter = new EventEmitter<string>;
    private onOpen?: (initialDimensions?: TerminalDimensions) => void;
    private onInput?: (data: string) => void;
    private onClose?: () => void;
    private onSetDimensions?: (dimensions: TerminalDimensions) => void;
    private opts: ExtensionTerminalOptions;
    private terminalInstance: Terminal | undefined;

    constructor(name: string, opts?: PseudoTerminalOptions) {
        this.opts = {
            pty: {
                onDidWrite: this.writeEmitter.event,
                onDidOverrideDimensions: this.overrideDimensionsEmitter.event,
                onDidClose: this.closeEmitter.event,
                onDidChangeName: this.changeNameEmitter.event,
                open: (initialDimensions?: vscode.TerminalDimensions) => {
                    if (this.onOpen) { this.onOpen(initialDimensions); }
                },
                close: () => {
                    if (this.onClose) { this.onClose(); }
                },
                handleInput: (data: string) => {
                    if (this.onInput) { this.onInput(data); }
                },
                setDimensions: (dimensions: TerminalDimensions) => {
                    if (this.onSetDimensions) { this.onSetDimensions(dimensions); }
                }
            },
            name: name,
            iconPath: opts?.iconPath,
            color: opts?.color,
            location: opts?.location,
            isTransient: opts?.isTransient,
        };
        if (!opts || opts?.create) {
            this.terminalInstance = window.createTerminal(this.opts);
        }
    }

    setOnOpen(callback?: (initialDimensions: TerminalDimensions | undefined) => void) {
        this.onOpen = callback;
    }

    setOnInput(callback?: (data: string) => void) {
        this.onInput = callback;
    }

    setOnClose(callback?: () => void) {
        this.onClose = callback;
    }

    setOnChangeDimensions(callback?: (dimensions: TerminalDimensions) => void) {
        this.onSetDimensions = callback;
    }

    write(data: string) {
        this.writeEmitter.fire(data);
    }

    setDimensions(dimensions?: TerminalDimensions) {
        this.overrideDimensionsEmitter.fire(dimensions);
    }

    show() {
        if (this.terminalInstance) { this.terminalInstance.show(); }
        else {
            let terminal = vscode.window.terminals.find((terminal) => {
                return terminal.name === this.opts.name ? terminal : undefined;
            });
            terminal?.show();
        }
    }

    close(n: number | void) {
        this.closeEmitter.fire(n);
    }

    get name(): string {
        return this.opts.name;
    }

    get options(): ExtensionTerminalOptions | undefined {
        if (!this.terminalInstance) { return this.opts; }
    }

    private get terminal(): Terminal | undefined {
        return this.terminalInstance;
    }
}

export { PseudoTerminal, PseudoTerminalOptions };