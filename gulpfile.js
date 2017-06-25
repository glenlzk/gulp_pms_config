/**
 * Created by glen on 2017/3/14.
 */

var gulp = require('gulp');

// 引入我们的gulp组件
var htmlmin = require('gulp-htmlmin'),          // 压缩html
    cssmin = require('gulp-minify-css'),        // 压缩css
    uglify = require('gulp-uglify'),			// JS文件压缩
    imagemin = require('gulp-imagemin'),		// imagemin 图片压缩
    pngquant = require('imagemin-pngquant'),	// imagemin 深度压缩
    livereload = require('gulp-livereload'),	// 网页自动刷新（服务器控制客户端同步刷新）
    webserver = require('gulp-webserver'),		// 本地服务器
    rename = require('gulp-rename'),			// 文件重命名
    sourcemaps = require('gulp-sourcemaps'),	// 来源地图
    changed = require('gulp-changed'),			// 只操作有过修改的文件
    concat = require("gulp-concat"), 			// 文件合并
    clean = require('gulp-clean'),				// 文件清理
    rev = require('gulp-rev'),                  // 解决缓存问题
    revCollector = require("gulp-rev-collector"),   // 替换指定文件
    usemin = require('gulp-usemin'),            // 执行一系列任务（例如合并文件并重全名、排除一些只在开发过程中引入的脚本以及将css和js中的代码提取出来内嵌在html文件中）
    connect = require('gulp-connect'),          // server
    url     = require('url'),
    proxy = require('http-proxy-middleware');   // proxy代理转发


/*------------------------全局设置------------------------------ */

/* gulp命令会由gulpfile.js运行，所以src和build文件夹路径如下（根目录下） */
var src = './src';                  // 开发源文件目录
var dest = './dist';                // 生成文件目录存放
var srcRev = src + '/rev-project';  // hash值替换后，新生成的文件存放目录
var revM = src + '/rev';        // M stand for mainfest.json

var config = {
    fonts: {
        src: src + "/fonts/**/*",
        dest: dest + '/fonts'
    },
    html: {
        revSrc: [srcRev + '/index.html', srcRev + '/login.html', srcRev + '/print/initprint.html'],
        revDest: [dest, dest, dest + '/print'],
        src: srcRev + '/page_template/**/*.html',
        dest: dest + '/page_template',
        settings: {
            removeComments: true,               //清除HTML注释
            collapseWhitespace: true,           //压缩HTML
            collapseBooleanAttributes: true,    //省略布尔属性的值 <input checked="true"/> ==> <input />
            removeEmptyAttributes: true,        //删除所有空格作属性值 <input id="" /> ==> <input />
            removeScriptTypeAttributes: true,   //删除<script>的type="text/javascript"
            removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
            minifyJS: true,                     //压缩页面JS
            minifyCSS: true                     //压缩页面CSS
        }
    },
    css: {
        src: srcRev + "/css/page_template/**/*.css",
        dest: dest + "/css/page_template",
        settings: {
            advanced: false,            //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: 'ie7',       //保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: true,           //类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*'    //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }
    },
    images: {
        src: src + "/images/**/*",
        revSrc: srcRev + "/images/**/*",
        dest: dest + "/images",
        settings: {
            progressive: true,                      // 无损压缩JPG图片
            svgoPlugins: [{removeViewBox: false}],  // 不要移除svg的viewbox属性
            use: [pngquant()]                       // 深度压缩PNG
        }
    },
    script: {
        src: srcRev + "/js/page_template/**/*.js",
        dest: dest + "/js/page_template",
        settings: {
            mangle: true,           //类型：Boolean 默认：true 是否修改变量名
            compress: true,         //类型：Boolean 默认：true 是否完全压缩
        }
    },
    copy: {                         // 注意js路劲相关配置
        revSrc: [
            src+'/css/**/*',
            src + '/js/**/*',
            src + '/page_template/**/*',
            src + '/print/**/*',
            src + '/*.html'
        ],
        revDest: [
            srcRev + '/css',
            srcRev + '/js',
            srcRev + '/page_template',
            srcRev + '/print',
            srcRev
        ],
        src: [srcRev + '/**/*.swf'],
        dest: [dest + '/js/global']
    },
    clean:{
        src: [dest, srcRev]
    }
}


// ------------------------------------------ 清除文件内容


gulp.task('clean', function() {
    var cln = config.clean
    return gulp.src(cln.src)
        .pipe(clean());
});

// ----------------------------------------- fonts 和 images生成 hash

/*

    步骤1：-------------------------------- 生成hash值
         // 以字体图标输出为例
         gulp.task('revFont', function() {
             var fonts = config.fonts;

             return gulp.src(fonts.src)
             .pipe(rev())                    // 需要添加hash值
             .pipe(gulp.dest(fonts.dest))    //
             .pipe(rev.manifest())           //
             .pipe(gulp.dest(revM + '/fonts'));
         });

        rev() ----- 项目通常只有字体图标，图片，文件名，需要添加hash值
            实际项目中，根据自己的项目需要,pms项目：文件名缓存问题由路由js路劲拼接版本号控制
               即是：js/page_template/home/initHome.js?v=3.1.3
            pms只需对字体图标 和 img缓存进行处理

        gulp.dest(fonts.dest)
            往往添加hash值的文件(字体图标 和 图片(如果不压缩))，都可以直接输出到dist

        rev.manifest()
            必须先执行rev()，才能执行此步骤，否则不会生成rev-manifest.json文件
            生成rev-manifest.json文件内容："iconfont.eot": "iconfont-8a5c668553.eot"
            用于替换对应文件里的文件名:

            // reset.css未替换前
            @font-face {
             font-family: "iconfont";
             src: url('../../fonts/iconfont.eot?t=1490337472600');
             src: url('../../fonts/iconfont.eot?t=1490337472600#iefix') format('embedded-opentype'),
                url('../../fonts/iconfont.woff?t=1490337472600') format('woff'),
                url('../../fonts/iconfont.ttf?t=1490337472600') format('truetype'),
                url('../../fonts/iconfont.svg?t=1490337472600#iconfont') format('svg');
            }
            // reset.css替换后
             @font-face {
                 font-family: "iconfont";
                 src: url('../../fonts/iconfont-8a5c668553.eot?t=1490337472600');
                 src: url('../../fonts/iconfont-8a5c668553.eot?t=1490337472600#iefix') format('embedded-opentype'),
                    url('../../fonts/iconfont-1ab7e0e573.woff?t=1490337472600') format('woff'),
                    url('../../fonts/iconfont-826cb6ce53.ttf?t=1490337472600') format('truetype'),
                    url('../../fonts/iconfont-615c61ea68.svg?t=1490337472600#iconfont') format('svg');
              }

        gulp.dest(revM + '/fonts')
              生成的rev-manifest.json文件输出到指定目录中，用于替换对应路径
              "iconfont.eot": "iconfont-8a5c668553.eot"
*/

//Fonts & Images 根据MD5获取版本号
gulp.task('revFont', function() {
    var fonts = config.fonts;

    return gulp.src(fonts.src)
        .pipe(rev())                    // 需要添加hash值
        .pipe(gulp.dest(fonts.dest))    // 往往生成hash值的文件(字体图标 和 图片(如果不压缩))，都可以直接输出到dist
        .pipe(rev.manifest())           // 生成rev-manifest.json文件："iconfont.eot": "iconfont-8a5c668553.eot",
        .pipe(gulp.dest(revM + '/fonts'));
});


gulp.task('revImg', function(){
    var images = config.images;

    return gulp.src(images.src)
            .pipe(rev())
            .pipe(gulp.dest(srcRev + '/images'))
            .pipe(rev.manifest())
            .pipe(gulp.dest(revM + '/images'))
});

// ------------------------------------- hash替换到js,css,html里

/*
    步骤2：-------------------------------- 替换hash值
            项目所有文件替换完成之后，生成到新的文件目录下(rev-project)，目的在于：
            方便接下来，进一步的打包，压缩js,css,html文件；
            并且【保持原有的路劲不变】


*/

// revCollector:js,html,css
gulp.task('revCollector', function() {
    var copy = config.copy;

    function copyFile(value, index) {
        return gulp.src(['src/rev/**/*.json', value])
            // 拿到所有rev-manifest.json文件，和需要替换所有文件(替换字体，图片或文件名等)
            .pipe(revCollector())    // 执行替换操作
            .pipe(gulp.dest(copy.revDest[index]));  // 替换完成输出路径
    };
    return copy.revSrc.forEach(function(value, index) {
        return copyFile(value, index);
    });
});

// ------------------- 打包压缩html,css,js,image
/*
 步骤3：-------------------------------- 新的目录中打包压缩，并最终输出剩余dist文件

    在新的目录中rev-project生成，进行打包，压缩js,css,html，图片等操作
*/

// HTML处理
gulp.task('html', function () {

    var html = config.html;
    var script = config.script;
    var css = config.css;
    /*
         usemin ----> 自动会把对应的css放到css/global/目录下
         <!-- build:css css/global/global.css -->
         <!-- endbuild -->

         参阅：index.html/login.html
    */
    html.revSrc.forEach(function (value, index) {
        gulp.src(value)
            .pipe(usemin({
                html: [htmlmin(html.settings)],
                css: [cssmin(css.settings), rev()],
                js: [uglify(script.settings), rev()]
            }))
            .pipe(gulp.dest(html.revDest[index]));
    });

    return gulp.src(html.src)
        .pipe(htmlmin(html.settings))
        .pipe(gulp.dest(html.dest));

});

// 处理css----src/css/template
gulp.task('css', function () {
    var css = config.css;

    // template
    return gulp.src(css.src)
        .pipe(cssmin(css.settings))
        .pipe(gulp.dest(css.dest));
});


// 图片压缩 src/images
gulp.task('images', function() {
    var images = config.images;

    gulp.src(images.revSrc)                            // 指明源文件路径，如需匹配指定格式的文件，可以写成 .{png,jpg,gif,svg}
        .pipe(imagemin(images.settings))
        .pipe(gulp.dest(images.dest))
});

// 压缩js----src/js/template
gulp.task('script', function() {
    var script = config.script;

    gulp.src(script.src)                      // 指明源文件路径、并进行文件匹配，排除 .min.js 后缀的文件
        .pipe(uglify(script.settings))                // 使用uglify进行压缩，并保留部分注释
        .pipe(gulp.dest(script.dest))

});

// copy 复制文件夹
gulp.task('copy', function() {
    var copy = config.copy;

    function copyFile(value, index) {
        return gulp.src(value)
            .pipe(rename({dirname: ''}))      // 防止把拷贝所在的目录页拷贝过去
            .pipe(gulp.dest(copy.dest[index]));
    };

    return copy.src.forEach(function(value, index) {
        return copyFile(value, index);
    });
});


// 说明
gulp.task('help',function () {
    console.log('	gulp build			文件打包');
    console.log('	gulp watch			文件监控打包');
    console.log('	gulp help			gulp参数说明');
    console.log('	gulp server			测试server');
    console.log('	gulp -p				生产环境（默认生产环境）');
    console.log('	gulp -d				开发环境');
    console.log('	gulp -m <module>		部分模块打包（默认全部打包）');
});


//--------------------------------------------------- Server
/*gulp.task('serve', function() {
 gulp.src(dest) // 服务器目录（.代表根目录）
 .pipe(webserver({ // 运行gulp-webserver
 livereload: true, // 启用LiveReload
 //host:'0.0.0.0',
 open: true // 服务器启动时自动打开网页
 }));
 gulp.start('watch');
 });*/
/*
 connect = require('gulp-connect'),
 url     = require('url'),
 proxy   = require('proxy-middleware');

 */


/*服务器代理转发：

 不要使用：
 "proxy-middleware": "^0.15.0"
 而要使用：
 proxy = require('http-proxy-middleware');

 ProxyPass /yzlpms http://192.168.7.235:8080/yzlpms
 ProxyPassReverse /yzlpms http://192.168.7.235:8080/yzlpms

 /yzlpms http://dev.inzlink.com:88
 */
// src服务器：
gulp.task('server1', function() {
    connect.server({
        livereload: true,
        root: src,
        port: 9999,
        middleware: function(connect, opt) {
            return [
                proxy('/yzlpms',{
                    // target: 'http://192.168.7.18',
                    target: 'http://dev.inzlink.com',
                    //target: 'http://192.168.7.189:8080',
                    changeOrigin: true
                })
            ]
        }
    });
    // gulp.start('watch');
});

// dist服务器：
gulp.task('server2', function() {
    connect.server({
        livereload: true,
        root: dest,
        port: 9999,
        middleware: function(connect, opt) {
            return [
                proxy('/yzlpms',{
                    target: 'http://dev.inzlink.com',
                    changeOrigin: true
                })
            ]
        }
    });
    // gulp.start('watch');
});


// ------------------------------------------ 打包压缩：1. gulp default 2.gulp output

// 打包压缩必须分两个步骤执行
// 否则会出现打出最终包会有问题
// 注意：用gulp-sequence、run-sequence(按顺序逐个同步地运行 Gulp 任务),合并为一个命令行打出包不齐全

gulp.task('rev',['clean'],function () {                     // 步骤1:
    gulp.start('help', 'revImg', 'revFont', 'revCollector');
});

gulp.task('build',function () {                             // 步骤2：
    gulp.start('html', 'css','images', 'script', 'copy');
});

// 完成步骤：1,2
gulp.task('default', ['rev']);
// 完成步骤：3
gulp.task('output',['build']);





