# slack-word-leaderboard
A stupid node app that uses slack's search api to generate a leaderboard for a search of a specific word or phrase in all PUBLIC slack rooms.

# to use
* have node & npm installed
* get a slack api auth token
* run `$ npm install`
* run `$ node src/index.js --query="YOUR WORD HERE" --token="YOUR TOKEN HERE"`

it should output a leaderboard into your terminal window.

*Note: Slack rate limits pretty hard, so anything above 150 pages in a minute will error out, so don't search for "the" or "a" or something.*

# additional arguments

* `--user=USERNAME` - will print out the list of messages returned for a specified user name
* `--logPriv=true` - prints out the username and room for all discarded private messages

# other stuff
this thing is still pretty janky, so don't get mad at me if it crashes or you get banned from slack for using it or it causes your house to burn down. Don't do anything nefarious with it either, okay?
