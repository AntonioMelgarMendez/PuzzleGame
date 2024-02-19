const path = require('path');

module.exports = function override(config, env) {
  config.module.rules.push({
    test: /\.(woff(2)?|ttf|eot|svg|png|jpg|jpeg|gif|mp3|wav)$/,
    use: [
      {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'assets/', // Puedes ajustar la carpeta de salida según tu estructura de carpetas
        },
      },
    ],
  });

  return config;
};
