const aws = require('aws-sdk');
const events = new aws.CloudWatchEvents();
const lambda = new aws.Lambda();

const FN_NAME = 'send-notification';
const RULE_NAME = 'send-notification-trigger';

exports.handler = (event, context, callback) => {
    
    events.removeTargets({
        Rule: RULE_NAME,
        Ids: ['1']
    }, function(err, data) {
        if (err) console.log(err);
        
        lambda.removePermission({
            FunctionName: FN_NAME,
            StatementId: FN_NAME + '-event'
        }, function(err, data) {
            if (err) console.log(err);
        
            events.deleteRule({
                Name: RULE_NAME,
            }, function(err, data) {
                if (err) console.log(err);
                
                callback(null, {});
            });
        });
    });
};