module.exports = function (eleventyConfig) {

  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("components");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("tokens.css");
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("script.js");

  return {
    dir: {
      input: ".",
      output: "_site"
    }
  };
};
