#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack';

const app = new cdk.App();
const name = app.node.tryGetContext('name');

// eslint-disable-next-line no-new
new InfraStack(app, `${name}-infra-stack`, {
  name,
  region: app.node.tryGetContext('region'),
});
