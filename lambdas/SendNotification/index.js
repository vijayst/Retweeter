const aws = require('aws-sdk');
const request = require('request');

const lambda = new aws.Lambda();
const FIREBASE_API_KEY = 'AAAAnz3327E:APA91bFh4KMAkJ2m3MET5z7K7LCLIFbumGCYKBqMFgqTn3tP63N4nHkHhMQnk7FHy5NgLADezLniQdRJ5KEGVQ_oX9_RYIbTvSX_9csNsCvChaT41nwej1116Fa6c3xxdM8__NUoN5af';

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
            request({
                url: 'https://fcm.googleapis.com/fcm/send',
                method: 'POST',
                headers: {
                    Authorization: `key=${FIREBASE_API_KEY}`
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
                    console.log('Some error', error, response.statusCode, body);
                }
            });
        } else {
            console.log('No tweets');
        }
    });
};