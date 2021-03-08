'use strict';

import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';

export class MetricsBucket extends cdk.Construct {
    public readonly Bucket: s3.IBucket;

    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);

        const securitySettings: s3.BucketProps = {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            removalPolicy: cdk.RemovalPolicy.RETAIN
        };

        this.Bucket = new s3.Bucket(this, 'MetricsOutputBucket', {
            ...securitySettings,
        });
        (this.Bucket.node.defaultChild as s3.CfnBucket).overrideLogicalId('metricsOutputBucket');

        this.Bucket.addToResourcePolicy(
            new iam.PolicyStatement({
                resources: [
                    `${this.Bucket.bucketArn}`,
                    `${this.Bucket.bucketArn}/*`
                ],
                actions: ["s3:*"],
                principals: [new iam.AnyPrincipal],
                effect: iam.Effect.DENY,
                conditions: {
                    Bool: {
                        'aws:SecureTransport': 'false'
                    }
                }
            })
        );

    }
}
