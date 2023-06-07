import * as vscode from 'vscode';
import { SerialPort } from 'serialport';
import { Event } from 'vscode';
import { error } from 'console';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('serialport.openSerialTerminal', async () => {
		// 获取用户选择的串口设备
		const selectedPort = await vscode.window.showQuickPick(getSerialPorts(), {
			placeHolder: 'Select a serial port'
		});

		const selectBoudRate = await vscode.window.showQuickPick(BoudRates(), {
			placeHolder: 'Select a boud rater'
		});

		if (selectedPort && selectBoudRate) {
			// 打开串口
			const port = new SerialPort({ path: selectedPort.label, baudRate: parseInt(selectBoudRate.label) }, (err) => {
				if (err) {
					vscode.window.showErrorMessage(err.message);
				}
			});

			const writeEmitter = new vscode.EventEmitter<string>();
			const pty: vscode.Pseudoterminal = {
				onDidWrite: writeEmitter.event,
				open: () => {
					if (port.isOpen) {
						writeEmitter.fire(`${port.path} opened successfully!\r\n`);
					} else {
						writeEmitter.fire("\x1b[1;31m " + port.path + "\x1b[0;31m open failure!\x1b[0m\r\n");
					}
				},
				close: () => { port.close(); },
				handleInput: (data) => {
					port.write(data);
				}
			};
			const terminal = vscode.window.createTerminal({ name: selectedPort.label, pty: pty });

			port.on("data", (data: Buffer) => {
				writeEmitter.fire(data.toString());
			});

			terminal.show();
		}
	});

	context.subscriptions.push(disposable);

	let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
	statusBarItem.text = "$(console) Serial Terminal";
	statusBarItem.tooltip = "Open a serial port on terminal";
	statusBarItem.command = "serialport.openSerialTerminal";
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);
}

function getSerialPorts(): Thenable<vscode.QuickPickItem[]> {
	return new Promise((resolve, reject) => {
		// 使用 serialport 模块获取可用的串口设备
		SerialPort.list()
			.then((ports) => {
				const portItems: vscode.QuickPickItem[] = ports.map((port) => {
					return { label: port.path, description: port.manufacturer };
				});

				resolve(portItems);
			})
			.catch((error) => {
				reject(error);
			});
	});
}

function BoudRates(): Thenable<vscode.QuickPickItem[]> {
	return new Promise((resolve, reject) => {
		// 选择波特率
		const portItems: vscode.QuickPickItem[] =
			[
				"115200",
				"9600",
				"19200",
				"38400",
				"76800",
				"153600",
				"460800",
				"921600",
				"2000000",
			].map((value) => { return { label: value }; });
		resolve(portItems);
	});
}

export function deactivate() { }
