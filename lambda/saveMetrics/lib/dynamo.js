'use strict';

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();

const {
    STATUS_TABLE,
} = process.env;

async function getLatestTimestamp() {
    try {
        const statusRecord = await dynamodb.getItem(
            {
                TableName: STATUS_TABLE,
                Key: {
                    'pk': { S: 'latestProcessedTimestamp' },
                }
            }
        ).promise()

        if (statusRecord.Item.value && statusRecord.Item.value.S) {
            return parseInt(statusRecord.Item.value.S)
        }
        return null
    } catch (error) {
        console.error('getLatestTimestamp.error', error);
    }
}

async function setLatestTimestamp(timestamp) {
    return await dynamodb
        .updateItem({
            TableName: STATUS_TABLE,
            Key: {
                pk: { S: 'latestProcessedTimestamp' },
            },
            UpdateExpression: "set #t = :val",
            ExpressionAttributeNames: {
                "#t": 'value',
            },
            ExpressionAttributeValues: {
                ":val": { S: timestamp.toString() },
            },
            ReturnValues: "ALL_NEW",
        })
        .promise();
}

module.exports = { 
    getLatestTimestamp,
    setLatestTimestamp
};