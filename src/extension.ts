import * as vscode from 'vscode';

// called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
	let activeEditor = vscode.window.activeTextEditor;
	let timeout: NodeJS.Timer | undefined = undefined;

	const baseStyle = vscode.window.createTextEditorDecorationType({
		borderWidth: '1px',
		borderStyle: 'solid',
		overviewRulerColor: 'blue',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		light: { // used in light color themes
			borderColor: 'darkblue'
		},
		dark: { // used in dark color themes
			borderColor: 'lightblue'
		},
	});
	if (activeEditor) {
		triggerUpdateDecorations();
	}

	const styleCache: { [key: string]: vscode.TextEditorDecorationType } = {};

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		timeout = setTimeout(updateDecorations, 500);
	}

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}
		vscode.workspace.findFiles('**/*.vslinter.js').then(linters => {
			if (!activeEditor) {
				return;
			}

			const { positionAt } = activeEditor.document;

			for (let linter of linters) {
				const { lint, style } = require(linter.fsPath);
				let ranges: Array<{ range: number[], hoverMessage: string }> = [];

				lint(activeEditor.document, ranges);

				const rangesToDecorate: vscode.DecorationOptions[] = ranges.map(e => {
					return { hoverMessage: e.hoverMessage, range: new vscode.Range(positionAt(e.range[0]), positionAt(e.range[1])) }
				});

				styleCache[linter.fsPath] = styleCache[linter.fsPath] || (style ? vscode.window.createTextEditorDecorationType(style(vscode)) : baseStyle);
				activeEditor.setDecorations(styleCache[linter.fsPath], rangesToDecorate);
			}

		});
	}

}
