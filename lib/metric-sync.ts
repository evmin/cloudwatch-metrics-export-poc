'use strict';

import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as events from "@aws-cdk/aws-events";
import * as s3 from '@aws-cdk/aws-s3';

import * as iam from '@aws-cdk/aws-iam';
import * as iamSec from './iam-permissions';
import * as path from 'path';
import * as dynamo from "@aws-cdk/aws-dynamodb";
import * as targets from "@aws-cdk/aws-events-targets";

export interface MetricSyncProps {
    readonly statusTable: dynamo.ITable,
    readonly metricsBucket: s3.IBucket
}

export class MetricSync extends cdk.Construct {

    public readonly dashboardName: string;

    constructor(scope: cdk.Construct, id: string, props: MetricSyncProps) {
        super(scope, id);

        // -------------------------------------------------------------------------------------------
        // Post Metrics
        const saveMetricsRole = new iam.Role(this, 'SaveMetricsRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
        });

        // Declaring the policy granting access to the stream explicitly to minimize permissions
        const saveMetricsRolePolicy = new iam.Policy(this, 'SaveMetricsRolePolicy', {
            statements: [
                new iam.PolicyStatement({
                    sid: 'permitReadDynamoDB',
                    effect: iam.Effect.ALLOW,
                    resources: [props.statusTable.tableArn],
                    actions: ['dynamodb:*']
                }),
                new iam.PolicyStatement({
                    sid: 'permitreadMetrics',
                    effect: iam.Effect.ALLOW,
                    actions: ['cloudwatch:*'],
                    resources: ['*']
                }),
                new iam.PolicyStatement({
                    sid: 'permitSaveMetrics',
                    effect: iam.Effect.ALLOW,
                    actions: ['s3:*'],
                    resources: [
                        `${props.metricsBucket.bucketArn}`,
                        `${props.metricsBucket.bucketArn}/*`,
                    ]
                }),
                iamSec.IamPermissions.lambdaLogGroup(`${cdk.Aws.STACK_NAME}-saveMetrics`)
            ]
        });
        saveMetricsRolePolicy.attachToRole(saveMetricsRole);

        const saveMetrics = new lambda.Function(this, 'saveMetrics', {
            functionName: `${cdk.Aws.STACK_NAME}-saveMetrics`,
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'index.handler',
            timeout: cdk.Duration.seconds(900),
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/saveMetrics')),
            role: saveMetricsRole,
            environment:
                {
                    STATUS_TABLE: props.statusTable.tableName,
                    BUCKET: props.metricsBucket.bucketName,
                    STACK_NAME: cdk.Aws.STACK_NAME
                }
        });
        saveMetrics.node.addDependency(saveMetricsRolePolicy);

        const saveMetricschedule = new events.Rule(this, 'saveMetricschedule', {
            schedule: {
                expressionString: 'rate(1 minute)'
            }
        });
        saveMetricschedule.addTarget(new targets.LambdaFunction(saveMetrics));

    }
}
