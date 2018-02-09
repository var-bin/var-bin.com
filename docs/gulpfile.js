// gulpfile.js

const path = require("path");

const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const htmlmin = require("gulp-htmlmin");
const rename = require("gulp-rename");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const watch = require("gulp-watch");
const uncss = require("postcss-uncss");
const svgSprite = require("gulp-svg-sprites");
const svgo = require("gulp-svgo");
const del = require("del");
const inject = require("gulp-inject");

const ASSETS_DIR = path.resolve(__dirname, "./assets");
const INDEX = path.resolve(__dirname, "./index.html");
const INDEX_TPL = path.resolve(__dirname, "./index.tpl.html");
const BASE_DIR = path.resolve("./");
const STYLES = path.join(ASSETS_DIR, "less", "styles.less");
const ASSETS_STYLES = path.join(ASSETS_DIR, "css");
const ASSETS_IMAGES = path.join(ASSETS_DIR, "images");
const ASSETS_SVG = path.join(ASSETS_IMAGES, "/*.svg");
const SVG_SPRITE = "images/sprite.svg";

// Static server
gulp.task("browser-sync", (cb) => {
  browserSync.init({
    server: BASE_DIR,
    files: [
      INDEX
    ],
    open: false
  });

  gulp.watch("./assets/less/**/*.less", gulp.series("styles", "htmlmin"));
  gulp.watch("./index.tpl.html")
    .on("change", gulp.series("styles", "htmlmin"));

  cb();
});

// html min
gulp.task("htmlmin", () => {
  return gulp.src(INDEX_TPL)
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(rename("index.html"))
    .pipe(gulp.dest(BASE_DIR));
});

// less, css
gulp.task("css", () => {
  return gulp.src(STYLES)
    .pipe(less())
    .pipe(postcss([
      autoprefixer
    ]))
    .pipe(gulp.dest(ASSETS_STYLES));
});

// css min
gulp.task("cssmin", () => {
  return gulp.src(path.join(ASSETS_STYLES, "styles.css"))
    .pipe(postcss([
      uncss({
        html: ["./index.tpl.html"],
      }),
      csso
    ]))
    .pipe(rename("styles.min.css"))
    .pipe(gulp.dest(ASSETS_STYLES));
});

gulp.task("styles", gulp.series("css", "cssmin"));

// watch Less files
gulp.task("watchLess", () => {
  const lessFiles = "./assets/less/**/*.less";

  watch(lessFiles, gulp.series("styles"));
});

// watch html template
gulp.task("watchHtml", () => {
  watch("./index.tpl.html", gulp.series("htmlmin"));
});

// watch
gulp.task("watch", gulp.parallel("watchLess", "watchHtml"));

gulp.task("dev", gulp.series("styles", "htmlmin", "browser-sync"));

gulp.task("prod", gulp.series("styles", "htmlmin"));

// svg sprite
gulp.task("sprite", () => {
  const cssFile = "less/sprite.less";
  const baseSize = 16;
  const preview = false;
  const template = path.join(BASE_DIR, "_sprite.tpl");
  const cssTemplate = require("fs").readFileSync(template, "utf-8");
  const notSpriteSVG = "!" + path.join(ASSETS_DIR, SVG_SPRITE);
  const mode = "symbols";

  return gulp.src([
    ASSETS_SVG,
    notSpriteSVG
  ])
    .pipe(svgo())
    .pipe(svgSprite({
      preview,
      mode
    }))
    .pipe(gulp.dest(ASSETS_IMAGES));
});

gulp.task("inject:svg", () => {
  const svg = "./assets/images/svg/symbols.svg";
  const starttag = "<!-- inject:svg -->";

  return gulp.src(INDEX_TPL)
    .pipe(inject(gulp.src(svg), {
      starttag,
      transform: (filePath, file) => {
        // return file contents as string
        return file.contents.toString("utf8")
      }
    }))
    .pipe(gulp.dest(BASE_DIR));
});

gulp.task("sprite:inject", gulp.series("sprite", "inject:svg"));
