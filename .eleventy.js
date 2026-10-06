module.exports = function (eleventyConfig) {

  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("components");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("tokens.css");
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("about.css");
  eleventyConfig.addPassthroughCopy("script.js");

 eleventyConfig.addFilter("readableDate", function (value) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    }).format(new Date(value));
  });



  
  return {
    dir: {
      input: ".",
      output: "_site"
    }
  };
};
