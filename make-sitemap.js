/* eslint-env node */

"use strict";

const fs = require("fs");
const path = require("path");

const DOCS_DIR = "docs";
const BASE_URL = "https://software-substrates.github.io/proceedings";
const SITEMAP_PATH = path.join(DOCS_DIR, "sitemap.xml");

/**
 * Recursively collect all files under a directory matching given extensions.
 * @param {String} dir - The directory to walk.
 * @param {String[]} exts - The file extensions to include (e.g. [".html", ".pdf"]).
 * @param {String[]} results - Accumulated list of matching file paths.
 * @return {String[]} - All matching file paths found under dir.
 */
function collectFiles(dir, exts, results) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            collectFiles(fullPath, exts, results);
        } else if (exts.includes(path.extname(entry.name).toLowerCase())) {
            results.push(fullPath);
        }
    }
    return results;
}

/**
 * Convert a local docs-relative file path to a public URL.
 * @param {String} filePath - The local path starting with "docs/".
 * @return {String} - The corresponding public URL.
 */
function toUrl(filePath) {
    const relative = filePath.slice(DOCS_DIR.length).replace(/\\/g, "/");
    const encoded = relative.split("/").map(encodeURIComponent).join("/");
    return BASE_URL + encoded;
}

/**
 * Format a Date as YYYY-MM-DD for use in sitemap lastmod tags.
 * @param {Date} date - The date to format.
 * @return {String} - The formatted date string.
 */
function formatDate(date) {
    return date.toISOString().slice(0, 10);
}

/**
 * Build and write docs/sitemap.xml from all .html and .pdf files under docs/.
 */
function makeSitemap() {
    const files = collectFiles(DOCS_DIR, [".html", ".pdf"], []);

    const today = formatDate(new Date());

    const urlEntries = files.map(function (filePath) {
        const url = toUrl(filePath);
        return (
            "  <url>\n" +
            "    <loc>" + url + "</loc>\n" +
            "    <lastmod>" + today + "</lastmod>\n" +
            "  </url>"
        );
    });

    const xml =
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
        "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n" +
        urlEntries.join("\n") + "\n" +
        "</urlset>\n";

    fs.writeFileSync(SITEMAP_PATH, xml, "utf8");
    console.log("Wrote " + SITEMAP_PATH + " with " + files.length + " URL(s).");
}

makeSitemap();
