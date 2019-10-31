module.exports = {
	style(vscode) {
		return {
			borderWidth: '1px',
			borderStyle: 'dotted',
			overviewRulerColor: 'red',
			overviewRulerLane: vscode.OverviewRulerLane.Right,
			light: { borderColor: 'lightred' },
			dark: { borderColor: 'darkred' },
		};
	},
	lint(document, rangesToDecorate) {
		const regex = /\scat\s/g
		const text = document.getText();
		let match = regex.exec(text);

		while (match) {
			const decoration = {
				'range': [match.index + 1, match.index + match[0].length - 1],
				'hoverMessage': 'Meow~'
			};
			rangesToDecorate.push(decoration);
			match = regex.exec(text);
		}
	}
}
