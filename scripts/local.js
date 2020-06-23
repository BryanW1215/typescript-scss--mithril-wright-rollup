const wright = require('wright'),
    rollup = require('rollup'),
    typescript = require('@rollup/plugin-typescript'),
    commonJs = require('@rollup/plugin-commonjs'),
    sass = require('node-sass');


wright({
    main: 'assets/index.html',
    serve: 'assets',
    port: 3000,
    js: {
        path: 'app.js',
        compile: compileTS,
        watch: 'src/**/*.ts'
    },
    css: {
        path: 'styles.css',
        compile: compileSCSS,
        watch: 'src/**/*.scss'
    }
});

function compileTS() {
    return rollup.rollup(
        {
            input: 'src/app.ts',
            plugins: [typescript({sourceMap: true}), commonJs({sourcemap: true, extensions: ['.js', '.ts']})],
            output: {
                format: 'es',
                sourcemap: 'inline',
            }
        })
        .then(bundle => bundle.generate({format: 'iife', sourcemap: true})
            .then(result => {
                return result.output[0]
            }));
}

function compileSCSS() {
    return new Promise((resolve, reject) => {
        sass.render({file:'src/styles.scss'}, (err, result) => {
            resolve(result.css.toString())
        });
    });
}
