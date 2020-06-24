const buildOptions = {
    default: {
        distDir: 'dist',
        uglify: false,
        sourceMaps: true,
        treeShake: true,
    },
    local: {},
    dev: {},
    staging: {},
    production: {
        uglify: true,
        sourceMaps: false
    },
};
buildOptions.preprod = buildOptions.staging;
buildOptions.prod = buildOptions.production;

module.exports = buildOptions;
