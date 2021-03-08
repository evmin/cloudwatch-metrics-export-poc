import * as cdk from '@aws-cdk/core';
import {DynamoDataCatalog} from './ddb-data-catalog';
import {MetricsBucket} from './s3-metrics-bucket';
import {MetricSync} from "./metric-sync";

export class CloudwatchMetricExporterStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const metricsBucket = new MetricsBucket(this, 'metrcisBucket');
    const dynamoDataCatalog = new DynamoDataCatalog(this, 'dynamoDataCatalog');
    const metricSync = new MetricSync(this, `metricSync`, {
      statusTable: dynamoDataCatalog.statusTable,
      metricsBucket: metricsBucket.Bucket
    })

  }
}
