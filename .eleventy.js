const directoryOutputPlugin = require("@11ty/eleventy-plugin-directory-output");
const eleventySass = require("@11tyrocks/eleventy-plugin-sass-lightningcss");
const htmlmin = require("html-minifier");

module.exports = function (eleventyConfig) {
	eleventyConfig.setQuietMode(true);
	eleventyConfig.addPlugin(directoryOutputPlugin);
	eleventyConfig.addPlugin(eleventySass);

	//Passthrough copy
	// eleventyConfig.addPassthroughCopy("./src/fonts");
	// eleventyConfig.addPassthroughCopy("./src/images");
	// eleventyConfig.addPassthroughCopy("./src/scripts");
	// eleventyConfig.addPassthroughCopy({"./src/favicons": "/"});
	// eleventyConfig.addPassthroughCopy("./src/manifest.webmanifest");

	//Watch target
	// eleventyConfig.addWatchTarget("./src/_includes/css/");
	// eleventyConfig.addWatchTarget('./src/scripts/');

	//Transforms
	eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
		// Eleventy 1.0+: use this.inputPath and this.outputPath instead
		if (
			process.env.NODE_ENV === "production" &&
			this.outputPath &&
			this.outputPath.endsWith(".html")
		) {
			let minified = htmlmin.minify(content, {
				useShortDoctype: false,
				removeComments: true,
				collapseWhitespace: true,
				collapseBooleanAttributes: true,
			});
			return minified;
		}

		return content;
	});

	return {
		// dataTemplateEngine: "njk",
		markdownTemplateEngine: "njk",
		htmlTemplateEngine: "njk",
		dir: {
			input: "src",
			output: "public",
		},
	};
};
