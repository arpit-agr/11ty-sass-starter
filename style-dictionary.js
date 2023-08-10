const StyleDictionary = require("style-dictionary");
const palettes = require("./src/design-tokens/palettes.json");
const siteTheme = require("./src/design-tokens/site.theme.json");
const fs = require("fs");

const generatedDir = "./src/css/global/generated";
!fs.existsSync(generatedDir) && fs.mkdirSync(generatedDir);

let styleDictionary = StyleDictionary.extend({
	format: {
		"scss/site-theme": function ({ dictionary: { allTokens }, file }) {
			const coreTokens = allTokens.filter((t) => !/^dark-/.test(t.name));
			const darkTokens = allTokens.filter((t) => !coreTokens.includes(t));

			const getTokenValue = (token) => {
				const darkTokenName = `dark-${token.name}`;
				const darkToken = darkTokens.find((t) => t.name === darkTokenName);
				return darkToken
					? `var(--light, ${token.value}) var(--dark, ${darkToken.value})`
					: token.value;
			};

			return [
				StyleDictionary.formatHelpers.fileHeader({ file }),
				":root {",
				...coreTokens.map((t) => `  --${t.name}: ${getTokenValue(t)};`),
				"}",
			].join("\n");
		},
	},
});

// Select the first theme in site.theme.json
const name = Object.keys(siteTheme)[0];
const theme = siteTheme[name];
const themeWithColors = createThemeWithPaletteColors(theme);
const baseFilePath = saveBaseFile(name, themeWithColors);
buildTokens(name, baseFilePath);

function createThemeWithPaletteColors(theme) {
	return {
		color: {
			onPrimary: { value: theme.onPrimary },
			primary: palettes[theme.primary],
			neutral: palettes[theme.neutral],
		},
		dark: {
			color: {
				primary: palettes[`${theme.primary}-dark`],
				neutral: palettes[`${theme.neutral}-dark`],
			},
		},
	};
}

function saveBaseFile(name, theme) {
	const filePath = `./src/design-tokens/base.${name}.json`;
	fs.writeFileSync(filePath, JSON.stringify(theme, null, 2));
	return filePath;
}

function buildTokens(name, baseFilePath) {
	styleDictionary
		.extend({
			source: ["./src/design-tokens/tokens.*.json", baseFilePath],
			platforms: {
				scss: {
					transformGroup: "scss",
					files: [
						{
							destination: `${generatedDir}/_variables.scss`,
							format: "scss/site-theme",
							filter: (t) => !t.original.private,
						},
					],
				},
			},
		})
		.buildAllPlatforms();

	// Delete the generated json file after the build
	fs.unlinkSync(baseFilePath);
}
