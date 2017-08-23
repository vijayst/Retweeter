const aws = require('aws-sdk');
const events = new aws.CloudWatchEvents();
const lambda = new aws.Lambda();

const FREQUENCY = 'rate(1 hour)';
const FN_NAME = 'send-notification';
const FN_ARN = 'arn:aws:lambda:us-west-2:442832139187:function:send-notification';
const RULE_NAME = 'send-notification-trigger';

exports.handler = (event, context, callback) => {
    
    events.putRule({
        Name: RULE_NAME,
        ScheduleExpression: FREQUENCY,
        State: 'ENABLED',
    }, function(err, data) {
        if (err) console.log(err);
        
        lambda.addPermission({
            FunctionName: FN_NAME,
            StatementId: FN_NAME + '-event',
            Action: 'lambda:InvokeFunction',
            Principal: 'events.amazonaws.com',
            SourceArn: data.RuleArn
        }, function(err, data) {
            if (err) console.log(err);
            
            const inputEvent = {
                query: event.query,
                fcm_token: event.fcm_token
            };
            
            events.putTargets({
                Rule: RULE_NAME,
                Targets: [{
                    Id: '1',
                    Arn: FN_ARN,
                    Input: JSON.stringify(inputEvent)
                }]
            }, function(err, data) {
                if (err) console.log(err);
               
                lambda.invoke({
                    FunctionName: 'search-tweets',
                    Payload: JSON.stringify({ query: event.query })
                }, function (error, data) {
                    if (err) console.log(err);
                    
                    callback(null, JSON.parse(data.Payload)); 
                });
            });
        });
    });
    
};