const aws = require('aws-sdk');
const request = require('request');

const lambda = new aws.Lambda();

exports.handler = (event, context, callback) => {
    lambda.invoke({
        FunctionName: 'search-tweets',
        Payload: JSON.stringify(event)
    }, function (error, data) {
        if (error) {
            context.done('error', error);
        } else if (data.Payload) {
            // send a push notification!
            const payload = JSON.parse(data.Payload);
            if (payload.length) {
                request({
                    url: 'https://fcm.googleapis.com/fcm/send',
                    method: 'POST',
                    headers: {
                        Authorization: `key=${process.env.FIREBASE_API_KEY}`
                    },
                    json: true,
                    body: {
                        notification: {
                            title: 'Your Tweets',
                            text: `There are ${payload.length} tweets`,
                        },
                        data: {
                            message: data.Payload
                        },
                        to: event.fcm_token
                    }
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        callback(null, payload);
                    } else {
                        context.done('error', error);
                    }
                });
            }
        } else {
            callback(null, []);
        }
    });
};