'use strict';

const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const dynamo = require('./lib/dynamo.js');
const metrics = require('./lib/metrics.js');
const moment = require("moment");

const {
    BUCKET,
} = process.env;

async function handler() {

    let latestProcessedTimestamp = await dynamo.getLatestTimestamp();

    if (null === latestProcessedTimestamp){
        latestProcessedTimestamp = moment().subtract(1,'hour').unix()
        await dynamo.setLatestTimestamp(latestProcessedTimestamp)
    }

    const timestampNow = moment();
    const timestampNowUnix = timestampNow.unix();

    const instance_id = 'i-0366f4428228176e4'

    // let data = await metrics.getEC2MetricData(instance_id, 'NetworkIn', latestProcessedTimestamp, timestampNowUnix)
    let data = await metrics.getEC2MetricData(instance_id, 'NetworkIn', timestampNowUnix - 3600, timestampNowUnix)

    console.log(JSON.stringify(data))

    let i = 0
    let csv = ""

    data[0]["Timestamps"].forEach(function(entry) {
         csv += `${entry.toISOString()},${data[0]["Values"][i]}`+"\n"
         i++
    })

    console.log(JSON.stringify(csv))

    const year = timestampNow.year();
    const month = timestampNow.month();
    const day = timestampNow.day();
    const hour = timestampNow.hour();

    let uploadResult = await s3
        .putObject({
            Bucket: BUCKET,
            Key: `ec2-network/${year}/${month}/${day}/${hour}/${timestampNowUnix}`,
            Body: csv,
        })
    .promise();

    await dynamo.setLatestTimestamp(timestampNowUnix)
}

module.exports = {
    handler
};
