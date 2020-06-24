const rollup = require('rollup'),
    typescript = require('@rollup/plugin-typescript'),
    commonJs = require('@rollup/plugin-commonjs'),
    rReplace = require('@rollup/plugin-replace'),
    rUglify = require('rollup-plugin-uglify'),
    sass = require('node-sass'),
    shortId = require('shortid'),
    fs = require('fs'),
    fsExtra = require('fs-extra'),
    path = require('path'),
    allBuildOptions = require('./build-options');
const environment = process.env.ENV;
if (!environment) {
    console.error('ENV environment variable not set!');
    return;
}

const cacheBuster = shortId();
const buildOptions = Object.assign(allBuildOptions.default, allBuildOptions[process.env.ENV]);


async function build() {
    console.log('Cleaning Dist Director');
    cleanDistDir();
    console.log('Copying Assets');
    fsExtra.copySync('assets', buildOptions.distDir);
    console.log('Building JS and CSS');
    await Promise.all([writeAppJs(), writeCSS()]);
    console.log('Appending Cache Buster to Index.js');
    await addCacheBusterToIndex();
    console.log('Build complete');
}

function addCacheBusterToIndex() {
    const indexPath = path.join(buildOptions.distDir, 'index.html');
    let indexContents = fs.readFileSync(indexPath, 'utf-8');
    indexContents = indexContents.replace('app.js', `app.${cacheBuster}.js`);
    indexContents = indexContents.replace('styles.css', `styles.${cacheBuster}.css`);
    fs.writeFileSync(indexPath, indexContents, 'utf-8');
}

function cleanDistDir() {
    if (fs.existsSync(buildOptions.distDir)) {
        fsExtra.emptyDirSync(buildOptions.distDir);
    } else {
        fs.mkdirSync(buildOptions.distDir);
    }
}

function writeAppJs() {

    const environmentFile = `environments/environment.${process.env.ENV}`;
    const pluginOptions = {
        typescript :{},
        commonJs: {extensions: ['.js', '.ts']}
    };
    if(buildOptions.sourceMaps){
        pluginOptions.typescript.sourceMap = true;
        pluginOptions.commonJs.sourcemap = true;
    }
    const plugins = [
        rReplace({
            'environments/environment': environmentFile,
        }),
        typescript(pluginOptions.typescript),
        commonJs(pluginOptions.commonJs)
    ];

    if (buildOptions.uglify) {
        plugins.push(rUglify.uglify());
    }


    const rollUpOptions = {
        input: 'src/app.ts',
        plugins: plugins,
        treeshake: buildOptions.treeShake,
        output: {
            format: 'es6',
        }
    };
    if(buildOptions.sourceMaps){
        rollUpOptions.output.sourcemap = 'inline';
    }

    return rollup
        .rollup(rollUpOptions)
        .then(bundle => {
            const bundleWriteOptions = {file: path.join(buildOptions.distDir, `app.${cacheBuster}.js`)};
            if (buildOptions.sourceMaps) {
                Object.assign(bundleWriteOptions,
                    {
                        sourcemap: buildOptions.sourceMaps,
                        sourcemapFile: path.join(buildOptions.distDir, `app.${cacheBuster}.map.js`)
                    }
                )
            }
            bundle.write(bundleWriteOptions);
        });
}

function writeCSS() {
    return new Promise((resolve) => {
        sass.render({file: 'src/styles.scss'}, (err, result) => {
            fs.writeFileSync(path.join(buildOptions.distDir, `styles.${cacheBuster}.css`), result.css.toString());
            resolve()
        });
    });
}

build();
