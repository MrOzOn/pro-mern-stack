const express = require('express');

const MongoClient = require('mongodb').MongoClient;
const Issue = require('./issue.js');

const app = express();
app.use(express.static('static'));

const bodyParser = require('body-parser');
app.use(bodyParser.json());

if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');

  const config = require('../webpack.config');
  config.entry.app.push('webpack-hot-middleware/client',
    'webpack/hot/only-dev-server');

  const bundler = webpack(config);


  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  // config.plugins.push(new webpack.HotModuleReplacementPlugin().apply(bundler));

  app.use(webpackDevMiddleware(bundler));
  app.use(webpackHotMiddleware(bundler, { log: console.log }));
}

app.get('/api/issues', (req, res) => {
  db.collection('issues').find().toArray().then(issues => {
    const metadata = { total_count: issues.length };
    res.json({ _metadata: metadata, records: issues })
  }).catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

app.post('/api/issues', (req, res) => {
  const newIssue = req.body;
  newIssue.created = new Date();
  if (!newIssue.status)
    newIssue.status = 'New';

  const err = Issue.validateIssue(newIssue)
  if (err) {
    res.status(422).json({ message: `Invalid requrest: ${err}` });
    return;
  }

  db.collection('issues').insertOne(newIssue).then( result => 
      db.collection('issues').find({ _id: result.insertedId }).limit(1).next()
    ).then(newIssue => {
      res.json(newIssue);
    }).catch(error => {
      console.log(error);
      res.status(500).json({ message: `Internal Server Error: ${error}` });
    });  
});

let db;
MongoClient.connect('mongodb://127.0.0.1').then(connection => {
  db = connection.db("issuetracker");
  app.listen(3000, function () {
    console.log('App started on port 3000!!');
  });
}).catch(error => {
  console.log('ERROR:', error);
})
;
