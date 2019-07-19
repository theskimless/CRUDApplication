const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
// ImageminPlugin
const ImageminPlugin = require("imagemin-webpack-plugin").default;
const imageminMozjpeg = require('imagemin-mozjpeg');

var PATHS = {
  dist: path.resolve(__dirname, "dist"),
  src: path.resolve(__dirname, "src")
}

module.exports = function(env, argv) {
  let isProduction = argv.mode === "production";
  console.log("MODE: " + isProduction);

  var config = {
    context: PATHS.src,
  
    entry: {
      app: "./index.js"
    },
  
    output: {
      path: PATHS.dist,
      filename: "js/[name].js"
    },

    devtool: isProduction ? false : 'source-map',
  
    devServer: {
      contentBase: PATHS.dist,
      port: 8081,
      overlay: true
    },
  
    resolve: {
      alias: {
        "vue$": "vue/dist/vue.esm.js"
      }
    },

    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: "vue-loader"
        },
        {
          test: /\.js$/,
          loader: "babel-loader",
          exclude: /node_modules/,
          options: { presets: ["@babel/preset-env"] }
        },
        {
          test: /\.scss/,
          use: [
            // "vue-style-loader",
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            {
              loader: "css-loader",
              options: { 
                sourceMap: true,
                url: false
               }
            },
            "postcss-loader",
            {
              loader: "sass-loader",
              options: { sourceMap: true }
            }
          ]
        },
        // {
        //   test: /\.(jpe?g|png|gif|svg)$/i,
        //   loader: "file-loader",
        //   options: {
        //     name: "[paht][name].[ext]",
        //     outputPath: `${PATHS.dist}/imgs`
        //   }
        // }
      ]
    },
  
    plugins: [
      new HtmlWebpackPlugin({
        template: `${PATHS.src}/index.html`,
        filename: "index.html"
      }),
      new CopyWebpackPlugin([
        { from: `${PATHS.src}/imgs`, to: `${PATHS.dist}/imgs/` },
        { from: `${PATHS.src}/fonts`, to: `${PATHS.dist}/fonts/` },
      ]),
      new VueLoaderPlugin()
    ]
  };

  if(isProduction) {
    config.plugins.push(
      new ImageminPlugin({
        pngquant: ({quality: [0.7, 0.7]}),
        plugins: [
          imageminMozjpeg({
            quality: 70,
            progressive: true
          })
        ]
      })
    );

    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: "css/[name].css"
      }),
    );
  }

  return config;
}
