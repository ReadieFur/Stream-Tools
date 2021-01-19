const path = require("path");
module.exports = {
    entry: "./ts_src/main.ts.ts",
    output: {
        path: path.resolve(__dirname, "wwwroot"),
        filename: "[name].ts.js",
        publicPath: "/"
    },
    resolve: {
        extensions: [".js", ".ts"]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
            }
        ]
    }
};