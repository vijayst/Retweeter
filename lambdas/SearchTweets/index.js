const Twit = require('twit');
const moment = require('moment');

const bot = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    app_only_auth: true,
    timeout_ms: 2000
});

exports.handler = (event, context, callback) => {
    bot.get('search/tweets', { q: event.query, count: 10 }, function (err, data) {
        if (err) {
            context.done('error', err);
        } else {
            const results = [];
            const oneHourAgo = moment().subtract(1, 'hours');
            data.statuses.forEach(function (status) {
                if (moment(status.created_at).isAfter(oneHourAgo)) {
                    results.push({
                        id: status.id,
                        name: status.user.screen_name,
                        text: status.text
                    });
                }
            });
            callback(null, results);
        }
    });
};