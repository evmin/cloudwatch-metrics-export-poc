'use strict';

import * as cdk from '@aws-cdk/core';
import * as dynamo from '@aws-cdk/aws-dynamodb';

export class DynamoDataCatalog extends cdk.Construct {
    public readonly statusTable: dynamo.ITable;

    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);

        const statusTable = new dynamo.Table(this, 'SyncStatusTable', {
            tableName: `${cdk.Aws.STACK_NAME}-sync-status-table`,
            partitionKey: {name: "pk", type: dynamo.AttributeType.STRING},
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            pointInTimeRecovery: true,
            billingMode: dynamo.BillingMode.PAY_PER_REQUEST
        });
        this.statusTable = statusTable;
    }

}
