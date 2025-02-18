// webpack.config.mjs
import { fileURLToPath, URL } from 'node:url';
import { VueLoaderPlugin } from 'vue-loader';
import { VuetifyPlugin } from 'webpack-plugin-vuetify';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import sass from 'sass';

export default {
 mode: 'production', // 本番:production 開発:development
 entry: './main.ts', // エントリーポイント
 context: fileURLToPath(new URL('./src', import.meta.url)), // 対象フォルダ
 output: {
  filename: (pathData) => {
   if (pathData.chunk.name === 'config') {
    return 'config.js'; // config.js を editor.html と同じフォルダに出力
   }
   return 'Editor/[name].js'; // 他のファイルは通常通り出力
  },
  path: fileURLToPath(new URL('./dist', import.meta.url)), // 出力ディレクトリ
  clean: true // 出力ディレクトリをクリーンアップ
 },
 resolve: {
  extensions: ['.ts', '.js', '.vue', '.json'], // 拡張子の省略
  alias: {
   '@type': fileURLToPath(new URL('./src/type.ts', import.meta.url)),
   '@': fileURLToPath(new URL('./src', import.meta.url)),
   '@common': fileURLToPath(new URL('./src/common', import.meta.url)),
   '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
   '@composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
   '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
   vue: '@vue/runtime-dom'
  }
 },
 module: {
  rules: [
   // Vueファイル
   {
    test: /\.vue$/,
    use: 'vue-loader'
   },
   // TypeScriptファイル
   {
    test: /\.ts$/,
    exclude: /node_modules/,
    use: [
     {
      loader: 'ts-loader',
      options: {
       appendTsSuffixTo: [/\.vue$/],
       transpileOnly: true, // 型チェックを有効化
       configFile: 'tsconfig.json'
      }
     }
    ]
   },
   // CSSファイル
   {
    test: /\.css$/,
    use: ['style-loader', 'css-loader']
   },
   // SCSSファイル
   {
    test: /\.s(a|c)ss$/,
    use: [
     'style-loader',
     'css-loader',
     {
      loader: 'sass-loader',
      options: {
       implementation: sass
      }
     }
    ]
   },
   // 画像ファイル(要らないと思う)
   {
    test: /\.(eot|ttf|woff|woff2)$/,
    type: 'asset/resource'
   }
  ]
 },
 plugins: [
  // Vue用プラグイン
  new VueLoaderPlugin(),
  // Vuetify用プラグイン
  new VuetifyPlugin(),
  // HTMLプラグイン(小さいのでminifyは不要)
  new HtmlWebpackPlugin({
   template: './index.ejs',
   filename: 'editor.html',
   inject: 'body',
   // config.js は自動でバンドルしない
   scriptLoading: 'blocking'
  })
 ],
 externals: {
  './config.js': 'CONFIG' // 外部ファイルとして扱う
 },
 optimization: {
  minimize: true, // コードを最小化
  usedExports: true, // 使用されていないエクスポートを削除
  sideEffects: true, // サイドエフェクトがないコードを削除
  splitChunks: {
   // チャンクの分割を制御
   cacheGroups: {
    customConfig: {
     name: (module, chunks, cacheGroupKey) => {
      return 'config'; // 出力されるファイル名を 'config.js' に指定
     },
     test: /config\.js$/, // ルートフォルダにある config.js をターゲットに
     chunks: 'all',
     enforce: true
    },
    defaultVendors: {
     name: 'vendors', // ベンダーコードを 'vendors.js' に含める
     test: /[\\/]node_modules[\\/]/,
     chunks: 'all',
     enforce: true
    },
    default: {
     name: 'main', // アプリケーションコードを 'main.js' に含める
     chunks: 'all',
     enforce: true,
     minSize: 0
    }
   }
  },
  minimizer: [
   new TerserPlugin({
    terserOptions: {
     compress: {
      drop_console: false, // console.log等を削除
      pure_funcs: ['console.log'] // 特定の関数呼び出しを削除
     },
     mangle: true, // 変数名を短縮
     output: {
      comments: false // コメントを削除
     }
    }
   })
  ]
 }
};
