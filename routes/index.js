var express = require('express');
var router = express.Router();

const axios = require("axios");
const cheerio = require("cheerio");


let ulList = {};
ulList.lib = {
  name_: [],
  entire_: [],
  remain_: [],
  percent_: [],
  status_: []
};
ulList.bus = undefined;

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
        ulList.lib.name_[i] = $(element).find("td.clicker_align_left:nth-child(1)").text().replace(/^\s+|\s+$/gm, "");
        ulList.lib.entire_[i] = $(element).find("td.clicker_align_right:nth-child(2)").text().replace(/^\s+|\s+$/gm, "");
        ulList.lib.remain_[i] = $(element).find("td.clicker_align_right.clicker_font_bold > div").text().replace(/^\s+|\s+$/gm, "");
        ulList.lib.percent_[i] = $(element).find("td:nth-child(4) > div > span > b").text().replace(/^\s+|\s+$/gm, "");
        ulList.lib.status_[i] = $(element).find("td:nth-child(5) > span").text().replace(/^\s+|\s+$/gm, "");
        if(ulList.lib.status_[i] == '') ulList.lib.status_[i] = '운영중';
      }
    });
    // console.log("bodyList : ", ulList.lib.name_);
    // console.log("bodyList : ", ulList.lib.entire_);
    // console.log("bodyList : ", ulList.lib.remain_);
    // console.log("bodyList : ", ulList.lib.percent_);
    // console.log("bodyList : ", ulList.lib.status_);
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
  res.status(200).json(ulList.lib);
});

router.post('/api/post/nodejs-api', function(req, res) {
  var inputType = req.body.detailParams.inputType.value;
  if(inputType == "all") { // 모든 JSON
    res.status(200).json(ulList);
  } else if(inputType == "lib") { // 도서관 JSON
    res.status(200).json(ulList.lib);
  } else if(inputType == "bus") { // 버스 JSON
    res.status(200).json(ulList.bus);
  } else {
    res.status(200).json({
      "main_title" : "충남대학교 총학생회 챗봇 api",
      "input" : "all / lib / bus"
    });
  }
});

module.exports = router;
