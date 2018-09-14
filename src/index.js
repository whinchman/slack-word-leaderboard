var request = require('request-promise-native');
var argv = require('minimist')(process.argv.slice(2));

let pagecount = 0;
let wordCounts = {};
let currentPage = 1;
let myMessages = [];

if(!argv.token || !argv.query) {
  console.log('useage is --query=QUERY --token=TOKEN')
  return;
}

let query = argv.query;
let token = argv.token;
let trackUsername = argv.user;
let logPrivate = (!argv.logPriv ? argv.false : argv.logPriv)

function requestString(page, word) {
  return `https://slack.com/api/search.all?token=${token}&query=${word}&page=${page}&count=100&pretty=1`
}

function formatOutput(array) {
  let outputString = `Top ${query} Words\n`;
  var lastcount = -1;
  var rank = 0; 
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    let username = '@' + element[0];
    let count = element[1];
    if(lastcount !== count) {
      rank = rank + 1;
    }
    lastcount = count; 
    outputString = outputString + rank + '. ' + username + ' : ' + count + '\n';
  }

  return outputString;
}


function sortByCount(dict) {
  // Create items array
  var items = Object.keys(dict).map(function (key) {
    return [key, dict[key]];
  });

  // Sort the array based on the second element
  items.sort(function (first, second) {
    return second[1] - first[1];
  });

  return items; 
}

function nextPage(page) {
  let requestStr = requestString(page, query);
  request(requestStr)
    .then(function (body) {
      console.log('current page:', page)
      let bodyObj = JSON.parse(body)
      let msgCount = bodyObj.messages.paging.count
      for (let msgIndex = 0; msgIndex < msgCount; msgIndex++) {
        const msg = bodyObj.messages.matches[msgIndex];
        if(!msg) {
          console.log('no msg?');
          continue;
        }
        if(!msg.channel) {
          console.log('no channel?');
          continue;
        }
        let isChannel = msg.channel['is_channel'];
        let isPrivate = msg.channel['is_private'];
        let isIm = msg.channel['is_im'];
        let isGroupMsg = msg.channel['is_mpim'];

        if (!isIm && !isPrivate && !isGroupMsg) {
          let wordCount = wordCounts[msg.username];
          if (!wordCount) {
            wordCount = 1;
          } else {
            wordCount = wordCount + 1;
          }
          wordCounts[msg.username] = wordCount
          if(trackUsername && msg.username === trackUsername){
            let mymessageString = msg.channel['name'] + '--' + msg.text;
            myMessages.push(mymessageString)
          }
        } else {
          if(logPrivate) {
            console.log("Should be only my private channels:", isChannel, " is private: ", isPrivate, ' ', msg.username, " channel name: ", msg.channel['name'])
          }
          
        }

      }
      currentPage++
      if (currentPage < pagecount) {
        nextPage(currentPage)
      } else {
        let sorted = sortByCount(wordCounts)
        let formattedOutput = formatOutput(sorted)
        console.log('OUTPUT:\n', formattedOutput)
        console.log('----');
        for (let index = 0; index < myMessages.length; index++) {
          const element = myMessages[index];
          console.log(index, ' ', element);
        }
        
      }
    })
    .catch(function (err) {
      console.log('ERROR:', err)
    });
}
let initialRequest = `https://slack.com/api/search.all?token=${token}&query="${query}"&count=100&pretty=1`
console.log(initialRequest)
request(initialRequest)
  .then(function (body) {
    let bodyObj = JSON.parse(body)
    pagecount = bodyObj.messages.paging.pages;
    console.log('pageCount:', pagecount);
    nextPage(currentPage)
  })
  .catch(function (err) {
    console.log('ERROR:', err)
  });
