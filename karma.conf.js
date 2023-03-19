module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', 'webpack'],
        files: [
            'client/*.spec.jsx'
        ],
        preprocessors: {
            'client/*.spec.jsx': ['webpack', 'sourcemap']
        },
        webpack: {
            module: {
                rules: [
                    {
                        test: /\.(js|jsx)$/,
                        exclude: /node_modules/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-react',
                                    [
                                        "@babel/preset-env",
                                        {
                                            "modules": "commonjs",
                                            "targets": {
                                                "node": "current"
                                            }
                                        }
                                    ]
                                ],
                            },
                        },
                    },
                    {
                        test: /\.(css)$/,
                        use: ['style-loader', 'css-loader'],
                    },
                ],
            }
        },
        reporters: ['progress'],
        browsers: ['ChromeHeadless'],
        singleRun: true,
    })
}