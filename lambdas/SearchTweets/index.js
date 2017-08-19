const Twit = require('twit');
const moment = require('moment');

const bot = new Twit({
    consumer_key: '0hM58BwW0IYAZatViF0PtB27T',
    consumer_secret: '2dch5SYOM3nlmVLZExuAtYU9GVY7GW2MCiaWOk0t09R7pnAzTw',
    access_token: '181565054-kjXpkJ2xQtcGK4zuConSAdoma9l5KBmyVlgymnA2',
    access_token_secret: 'nl2QQrEDeUAmiYwdJrQey6XsRVZa1TPHxrwTIsk7OudHp',
    timeout_ms: 60000
});

exports.handler = (event, context, callback) => {
    bot.get('search/tweets', { q: event.query, count: 10 }, function(err, data) {
        const results = [];
        const oneHourAgo = moment().subtract(1, 'hours');
        data.statuses.forEach(function (status) {
            if (moment(status.created_at).isAfter(oneHourAgo)) {
                console.log(status.user.screen_name, status.text, '\n');
                results.push({
                    name: status.user.screen_name,
                    text: status.text
                });
            }
        });
        callback(null, results);
    });
};