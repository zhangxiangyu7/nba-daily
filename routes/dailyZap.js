var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var _ = require('lodash');
var utils = require('../lib/utils');


/* GET recent daily zap. */
router.get('/', function(req, res, next) {
  async.waterfall([
    getPage(1, 50),
    parsePage()
  ], function(err, result) {

    result = _.chain(result.results[0])
      .each(utils.formatDate)
      .value();

    if (req.xhr) {
      res.send(result);
    } else {
      res.render('index', {
        title: 'Daily Zap',
        videos: result
      });
    }
  })
});

function getPage(start, number) {
  start = start || 1;
  number = number || 44;
  var url = 'http://searchapp2.nba.com/nba-search/query.jsp?type=advvideo&start='+start+'&npp='+number+'&sub_category=Daily%20Zap&section=channels/top_plays&season=1415&sort=recent&site=nba&hide=true&csiID=csi2'
  console.log(url)
  return function(callback) {
    request(url, function(error, response, body) {
      if (error) {
        throw error;
      }
      callback(null, body);
    })
  }
}

function parsePage() {
  return function(body, callback) {
    var $ = cheerio.load(body);
    var json = $('#jsCode').text();

    json = JSON.parse(json.replace(/(\\')/g, '\''));
    callback(null, json);
  }
}

module.exports = router;
