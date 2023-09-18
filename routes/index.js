var express = require('express');
var router = express.Router();

const axios = require("axios");
const cheerio = require("cheerio");

let ulList = {
  name_: [],
  entire_: [],
  remain_: [],
  percent_: [],
  status_: []
};
const getHtml = async () => {
  try {
    // 1
    const html = await axios.get("https://clicker.cnu.ac.kr/Clicker/k/");
    // 2
    const $ = cheerio.load(html.data);
    // 3
    const bodyList = $("#table_board_list > tbody > tr"); //#table_board_list > tbody > tr:nth-child(1)
    bodyList.map((i, element) => {
      if(i < 9) {
        ulList.name_[i] = $(element).find("td.clicker_align_left:nth-child(1)").text().replace(/^\s+|\s+$/gm, "");
        ulList.entire_[i] = $(element).find("td.clicker_align_right:nth-child(2)").text().replace(/^\s+|\s+$/gm, "");
        ulList.remain_[i] = $(element).find("td.clicker_align_right.clicker_font_bold > div").text().replace(/^\s+|\s+$/gm, "");
        ulList.percent_[i] = $(element).find("td:nth-child(4) > div > span > b").text().replace(/^\s+|\s+$/gm, "");
        ulList.status_[i] = $(element).find("td:nth-child(5) > span").text().replace(/^\s+|\s+$/gm, "");
        if(ulList.status_[i] == '') ulList.status_[i] = '운영중';
      }
    });
    // console.log("bodyList : ", ulList.name_);
    // console.log("bodyList : ", ulList.entire_);
    // console.log("bodyList : ", ulList.remain_);
    // console.log("bodyList : ", ulList.percent_);
    // console.log("bodyList : ", ulList.status_);
  } catch (error) {
    console.error(error);
  }
};
getHtml();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/get/nodejs-api', function(req, res) {
  res.status(200).json(ulList);
});

router.post('/api/post/nodejs-api', function(req, res) {
  res.status(200).json({
    "message" : req.intent.id,
    "test" : "TEST"
  });
});

module.exports = router;
