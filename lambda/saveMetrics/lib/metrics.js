'use strict';

const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

async function getEC2MetricData(instanceId, metricName, startTime, endTime) {

  var params = {
    EndTime: endTime,
    StartTime: startTime,
    MetricDataQueries: [ 
      {
        Id: 'request',
        MetricStat: {
          Metric: {
            MetricName: metricName,
            Namespace: 'AWS/EC2',
            Dimensions: [
              {
                Name: 'InstanceId',
                Value: instanceId
              }
            ]
          },
          Period: 300,
          Stat: 'Average'
        },
        ReturnData: true
      },
    ],
    ScanBy: 'TimestampAscending'
  };

  // TODO: Implement multipage response by handling the next token

  try{
    const result = await cloudwatch.getMetricData(params).promise()
    return result.MetricDataResults
  }catch(e){
    console.log(e)
  }

  return null
}

module.exports = { 
    getEC2MetricData
};