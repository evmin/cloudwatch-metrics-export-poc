#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CloudwatchMetricExporterStack } from '../lib/cloudwatch-metric-exporter-stack';

const app = new cdk.App();
new CloudwatchMetricExporterStack(app, 'CloudwatchMetricExporterStack');
