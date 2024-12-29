const path = require("path");

module.exports = (env, argv) => {
  return {
    entry: "./src/index.ts",
    devtool: env == "development" && "inline-source-map",
    mode: env == "development" ? "development" : "production",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      filename: "index.js",
      path: path.resolve(__dirname, "docs"),
    },
    devServer: {
      static: {
        directory: path.join(__dirname, "docs"),
      },
      compress: true,
      port: 9000,
    },
  };
};
