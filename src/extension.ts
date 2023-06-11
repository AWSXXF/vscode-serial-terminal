import * as vscode from 'vscode';
import { SerialPort } from 'serialport';
import { getSerialPort, getSerialPortProvider, openSerialPortTerminal, pickBoudRate, pickSerialPort } from './serialPortManager';
import { registerCommands } from './commandManager';

export function activate(context: vscode.ExtensionContext) {
	registerCommands();
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

function boudRates(): Thenable<vscode.QuickPickItem[]> {
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
