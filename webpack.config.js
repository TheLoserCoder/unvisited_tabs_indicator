const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const output_path =  path.join(__dirname, "/extension");
const DisableOutputWebpackPlugin = require('disable-output-webpack-plugin');

module.exports = (env) => {
  const options = {};
  if(env.dev){
    options.mode = "development";
    options.devtool = "inline-source-map";
    options.watch = true;
    options.optimization = {minimize: false};
  }else{
    options.mode = "production";
  };
    const manifest_entry = env.dev ? "manifest.dev.json" : env.browser = "firefox" ? "manifest.firefox.json" : "manifest.chrome.json";
  return [
    //background
    {
      ...options,
      entry: `./src/js/background`,
      output: {
        path: output_path,
        filename: "background.js"
      },
      plugins: [
        new CopyPlugin({
          patterns: [
            {
              from:`./manifests/${manifest_entry}`,
              to: `${output_path}/manifest.json`
            },
            {
              from:`./src/html/popup.html`,
              to: `${output_path}/popup.html`
            },
            {
              from:`./src/icon/icon.png`,
              to: `${output_path}/icon.png`
            }
          ]
        }),
      ]
    },
    //content_script
    {
      ...options,
      entry: `./src/js/content_script`,
      output: {
        path: output_path,
        filename: "content_script.js"
      },
    },
    //popup
    {
      ...options,
      entry: `./src/js/popup`,
      output: {
        path: output_path,
        filename: "popup.js"
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              options: {
                presets: ['@babel/preset-env', '@babel/preset-react'],
                plugins: ["@babel/plugin-transform-runtime"]
              }
            },
          }
        ]
      }
    }
  ]
}