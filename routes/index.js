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
  status_: [],
  updateTime_: []
};
ulList.bus = { // display type - '14:16:24'
  "bus_list": ["A-1", "A-2", "B-1", "B-2"],
  "A-1": ['08:20:00', '08:30:00', '09:00:00', '09:30:00', '10:00:00', '11:00:00', '11:30:00', '12:55:00', '13:25:00', '13:55:00', '14:25:00', '15:25:00', '16:15:00', '17:15:00'],
  "A-2": ['08:45:00', '09:15:00', '09:45:00', '10:15:00', '10:45:00', '11:15:00', '12:45:00', '13:15:00', '13:45:00', '14:45:00', '15:45:00', '16:45:00', '17:30:00'],
  "B-1": ['08:40:00', '08:50:00', '09:20:00', '09:50:00', '10:20:00', '10:50:00', '11:40:00', '12:55:00', '13:25:00', '13:55:00', '14:25:00', '15:25:00', '16:25:00', '17:25:00'],
  "B-2": ['08:45:00', '08:55:00', '09:25:00', '09:55:00', '10:25:00', '10:55:00', '11:25:00', '12:50:00', '13:20:00', '13:50:00', '14:55:00', '15:55:00', '16:55:00', '17:40:00']
};

const getLibHtml = async () => {
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
        ulList.lib.updateTime_[i] = getToday();
        if(ulList.lib.status_[i] == '') ulList.lib.status_[i] = '예약 필요';
      }
    });
  } catch (error) {
    console.error(error);
  }
};
getLibHtml();

function getToday() {
  let curr = new Date();
  let utc = curr.getTime() + (curr.getTimezoneOffset() * 60 * 1000);
  let KR_TIME_DIFF = 9 * 60 * 60 * 1000;
  let today = new Date(utc + KR_TIME_DIFF);
  return [today.getFullYear(),
  "-",
  ('0' + (today.getMonth() + 1)).slice(-2),
  "-",
  ('0' + today.getDate()).slice(-2),
  " ",
  ('0' + today.getHours()).slice(-2),
  ":",
  ('0' + today.getMinutes()).slice(-2),
  ":",
  ('0' + today.getSeconds()).slice(-2)
  ].join("");
}

function getTodayDate() {
  let curr = new Date();
  let utc = curr.getTime() + (curr.getTimezoneOffset() * 60 * 1000);
  let KR_TIME_DIFF = 9 * 60 * 60 * 1000;
  let today = new Date(utc + KR_TIME_DIFF);
  return [today.getFullYear(),
  "-",
  ('0' + (today.getMonth() + 1)).slice(-2),
  "-",
  ('0' + today.getDate()).slice(-2)
  ].join("");
}

function getTodayTime() {
  let curr = new Date();
  let utc = curr.getTime() + (curr.getTimezoneOffset() * 60 * 1000);
  let KR_TIME_DIFF = 9 * 60 * 60 * 1000;
  let today = new Date(utc + KR_TIME_DIFF);
  return [('0' + today.getHours()).slice(-2),
  ":",
  ('0' + today.getMinutes()).slice(-2),
  ":",
  ('0' + today.getSeconds()).slice(-2)
  ].join("");
}

function isWeekend() {
  let curr = new Date();
  let utc = curr.getTime() + (curr.getTimezoneOffset() * 60 * 1000);
  let KR_TIME_DIFF = 9 * 60 * 60 * 1000;
  let today = new Date(utc + KR_TIME_DIFF);

  // 주말(토, 일) 판별
  if((today.getDay() == 0) || (today.getDay() == 6)) return true;
  
  // 공휴일 판별
  let holidays = [
    "2023-10-09", // 한글날
    "2023-12-25", // 성탄절
    "2024-01-01" // 새해
  ];
  for(var holiday of holidays) {
    if(getTodayDate() == holiday) return true;
  }

  return false;
}

function minuteToHour(inputMinute) {
  let hours = Math.floor(inputMinute / 60);
  let minutes = inputMinute % 60;

  if (inputMinute < 0 && minutes !== 0) {
    hours += 1;
    minutes = 60 - Math.abs(minutes);
  }

  if (hours === 0) {
    return minutes.toString();
  } else if (minutes === 0) {
    return hours + "시간";
  } else {
    return hours + "시간 " + minutes;
  }
}


router.get('/', function(req, res, next) {
  res.writeHead(200, {'Content-Type' : 'text/plain'});
  res.end("TEST");
});

router.get('/api/get/nodejs-api', function(req, res) {
  res.status(200).json(ulList.lib);
});

router.post('/api/post/nodejs-api', async function(req, res) {
  var inputType = req.body.action.detailParams.inputType.value;

  await getLibHtml();

  if(inputType == "all") { // 모든 JSON
    res.status(200).json(ulList);
  } else if(inputType == "lib") { // 도서관 JSON
    var tempList = [];
    var libImgList = ["https://library.cnu.ac.kr/image/ko/local/guide/floorB1.png",
    "https://clicker.cnu.ac.kr/clicker/users/chungnam/images/2020_B2LearningCommons.png",
    "https://clicker.cnu.ac.kr/clicker/users/chungnam/images/2020_B2CarrelZone.png",
    "https://library.cnu.ac.kr/image/ko/local/guide/floor1.png",
    "https://clicker.cnu.ac.kr/clicker/users/chungnam/images/2020_library_F2_redingroom2_A.png",
    "https://clicker.cnu.ac.kr/clicker/users/chungnam/images/2020_library_F2_redingroom2_B.png",
    "https://clicker.cnu.ac.kr/clicker/users/chungnam/images/2020_library_F2_redingroom2_notebook.png",
    "https://clicker.cnu.ac.kr/clicker/users/chungnam/images/2020_library_F2_redingroom3_A.png",
    "https://clicker.cnu.ac.kr/clicker/users/chungnam/images/2020_library_F2_redingroom3_B.png"];
    for(var i = 0; i < 9; i++) {
      tempList[i] = {
        "imageTitle": {
          "title": ulList.lib.name_[i],
          "description": ulList.lib.updateTime_[i] + " 기준"
        },
        "thumbnail": {
            "imageUrl": libImgList[i],
            "width": 800,
            "height": 400
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
              "items": [tempList[0], tempList[1], tempList[2]]
            }
          }, 
          {
            "carousel": {
              "type": "itemCard",
              "items": [tempList[3], tempList[4], tempList[5]]
            }
          }, 
          {
            "carousel": {
              "type": "itemCard",
              "items": [tempList[6], tempList[7], tempList[8]]
            }
          }
        ],
        "quickReplies": [
          {"label": "초기화면", "action": "block", "messageText": "초기화면", "blockId": "6502ac4d23f0db0378b89f3a"},
          {"label": "뒤로가기", "action": "block", "messageText": "각종 정보 확인하기", "blockId": "5c753aa405aaa75509eaa970"}
        ]
      }
    });
  } else if(inputType == "bus") { // 버스 JSON
    var tempBusList = [];
    for(var k = 0; k < ulList.bus.bus_list.length; k++) {
      var tempBusWait = [];
      var tempBusAct = [];
      var tempBusEnd = [];
      
      for(var i = 0; i < ulList.bus[ulList.bus.bus_list[k]].length; i++) {
        if(isWeekend()) break;

        var tempBusInfor = ulList.bus[ulList.bus.bus_list[k]][i].split(":");
        var tempTimeInfor = getTodayTime().split(":");
        var tempDateInfor = getTodayDate().split("-");
        var date1 = new Date(tempDateInfor[0], tempDateInfor[1], tempDateInfor[2], tempTimeInfor[0], tempTimeInfor[1]);
        var date2 = new Date(tempDateInfor[0], tempDateInfor[1], tempDateInfor[2], tempBusInfor[0], tempBusInfor[1]);
        var elapsedMSec = date2.getTime() - date1.getTime(); 
        var elapsedMin = elapsedMSec / 1000 / 60;
      
        var tempBusMsg = "[" + tempBusInfor[0] + ":" + tempBusInfor[1] + "] ";
        if(elapsedMin < -60) continue;
        else if(elapsedMin <= -30) { // 운행 종료
          tempBusMsg += "약 " + Math.abs(30+elapsedMin) + "분 전 운행종료";
          tempBusEnd.push(tempBusMsg);
        } else if(elapsedMin <= 0) { // 운행중
          tempBusMsg += Math.abs(elapsedMin) + "분 전 출발";

          // 첫차
          if(i == 0) {
            tempBusMsg += " (첫차)";
            // 월평역 출발
            if((ulList.bus.bus_list[k] == "A-1") || (ulList.bus.bus_list[k] == "B-1") || (ulList.bus.bus_list[k] == "B-2")) {
              tempBusMsg += "\n → 월평역 출발"
            }
          }
          // 막차
          else if(i == ulList.bus[ulList.bus.bus_list[k]].length-1) {
            tempBusMsg += " (막차)"; 
            if(ulList.bus.bus_list[k] == "A-2") tempBusMsg += "\n → 정심화국제문화회관 무정차\n → 유성온천역 하차";
            else if(ulList.bus.bus_list[k] == "B-2") tempBusMsg += "\n → 정심화국제문화회관 무정차\n → 유성시외버스터미널 하차";
          }
          tempBusAct.push(tempBusMsg);
        } else { // 운행대기
          if(tempBusWait.length < 2) {
            tempBusMsg += minuteToHour(elapsedMin) + "분 후 운행예정";
            if(i == 0) tempBusMsg += " (첫차)";
            else if(i == ulList.bus[ulList.bus.bus_list[k]].length-1) tempBusMsg += " (막차)";
            tempBusWait.push(tempBusMsg);
          }
        }
      }
      
      if(tempBusWait.length < 1) tempBusWait.push("당일 운행 예정인 버스가 없습니다.");
      if(tempBusAct.length < 1) tempBusAct.push("운행중인 버스가 없습니다.");
      if(tempBusEnd.length < 1) tempBusEnd.push("30분 이내 운행종료된 버스가 없습니다.");

      tempBusList.push({
        "text": ["🚌 " + ulList.bus.bus_list[k] + "호차",
        "\n🟡 운행대기",
        tempBusWait.join("\n"),
        "\n🟢 운행중",
        tempBusAct.join("\n"),
        "\n🔴 운행종료",
        tempBusEnd.join("\n")
        ].join("\n")
      });
    }

    res.status(200).json({
      "version": "2.0",
      "template": {
        "outputs": [
          // A노선
          {
            "carousel": {
              "type": "textCard",
              "items": [tempBusList[0], tempBusList[1]]
            }
          },
          // B노선
          {
            "carousel": {
              "type": "textCard",
              "items": [tempBusList[2], tempBusList[3]]
            }
          }
        ],
        "quickReplies": [
          {"label": "순환버스 시간표(전체)", "action": "block", "messageText": "순환버스 시간표", "blockId": "64fe6ba91cebbc71ec59033a"},
          {"label": "A노선", "action": "block", "messageText": "A노선", "blockId": "5c6fd10ee821274ba7895fce"},
          {"label": "B노선", "action": "block", "messageText": "B노선", "blockId": "5c70000805aaa75509ea8c7b"},
          {"label": "특별노선", "action": "block", "messageText": "특별노선", "blockId": "64fe699680900b5cc5da4565"},
          {"label": "대덕-보운", "action": "block", "messageText": "대덕-보운 노선", "blockId": "5c70017c5f38dd01ebc0a299"},
          {"label": "초기화면", "action": "block", "messageText": "초기화면", "blockId": "6502ac4d23f0db0378b89f3a"},
          {"label": "뒤로가기", "action": "block", "messageText": "각종 정보 확인하기", "blockId": "5c753aa405aaa75509eaa970"}
        ]
      }
    });

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
