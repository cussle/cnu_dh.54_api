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
        if(ulList.lib.status_[i] == '') ulList.lib.status_[i] = '예약 필요';
      }
    });
  } catch (error) {
    console.error(error);
  }
};
getHtml();

function getTime() {
  let today = new Date();
  return [today.getFullYear(),
  "-",
  ('0' + (today.getMonth() + 1)).slice(-2),
  "-",
  ('0' + today.getDate()).slice(-2),
  "-",
  " ",
  ('0' + today.getHours()).slice(-2),
  ":",
  ('0' + today.getMinutes()).slice(-2),
  ":",
  ('0' + today.getSeconds()).slice(-2)
  ].join("");
}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/get/nodejs-api', function(req, res) {
  res.status(200).json(ulList.lib);
});

router.post('/api/post/nodejs-api', function(req, res) {
  var inputType = req.body.action.detailParams.inputType.value;

  getHtml();

  if(inputType == "all") { // 모든 JSON
    res.status(200).json(ulList);
  } else if(inputType == "lib") { // 도서관 JSON
    var tempList = [];
    for(var i = 0; i < 9; i++) {
      tempList[i] = {
        "imageTitle": {
          "title": ulList.lib.name_[i],
          "description": getTime() + " 기준"
        },
        "itemList": [
            {
                "title": "운영방식",
                "description": ulList.lib.status_[i]
            },
            {
                "title": "전체좌석",
                "description": ulList.lib.entire_[i]
            },
            {
                "title": "잔여좌석",
                "description": ulList.lib.remain_[i]
            },
            {
                "title": "사용율",
                "description": ulList.lib.percent_[i]
            }
        ]
      }
    }

    res.status(200).json({
      "version": "2.0",
      "template": {
        "outputs": [
          {
            "carousel": {
              "type": "itemCard",
              "items": tempList
            }
          }
        ]
      }
    });
  } else if(inputType == "bus") { // 버스 JSON
    res.status(200).json(ulList.bus);
  } else {
    res.status(200).json({
      "version": "2.0",
      "data": {
        "main_title" : "충남대학교 총학생회 챗봇 api",
        "input" : "all / lib / bus"
      }
    });
  }
});

module.exports = router;
