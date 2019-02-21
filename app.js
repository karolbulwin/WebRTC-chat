const express = require('express');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const sassMiddleware = require('node-sass-middleware');

const app = express();
const port = process.env.PORT || 4003;

app.use(morgan('dev'));
app.use(sassMiddleware({
  src: path.join(__dirname),
  dest: path.join(__dirname),
  debug: true,
  // outputStyle: 'compressed',
  indentedSyntax: false,
  sourceMap: true,
}));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static('/'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('chat.html'));
});

app.listen(port, () => {
  debug(`Listening on ${port}`);
});
