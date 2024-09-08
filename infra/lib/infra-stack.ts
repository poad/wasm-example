import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface InfraStackProps extends cdk.StackProps {
  name: string;
  region: string;
}

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: InfraStackProps) {
    super(scope, id, props);

    const s3BucketName = `${props.name}-static-site`;

    const s3bucket = new s3.Bucket(this, 'S3Bucket', {
      bucketName: s3BucketName,
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: false,
      accessControl: s3.BucketAccessControl.PRIVATE,
      publicReadAccess: false,
      websiteIndexDocument: 'index.html',
    });

    // CloudFront Functionリソースの定義
    const websiteIndexPageForwardFunction = new cloudfront.Function(
      this,
      'WebsiteIndexPageForwardFunction',
      {
        functionName: `${props.name}-static-site-function`,
        code: cloudfront.FunctionCode.fromFile({
          filePath: 'function/index.js',
        }),
      },
    );
    (
      websiteIndexPageForwardFunction.node
        .defaultChild as cdk.aws_cloudfront.CfnFunction
    ).addPropertyOverride('FunctionConfig.Runtime', 'cloudfront-js-2.0');

    const originAccessControl = new cloudfront.S3OriginAccessControl(
      this,
      'OriginAccessControl',
      {
        originAccessControlName: `${props.name}-static-site-oac`,
        signing: cloudfront.Signing.SIGV4_NO_OVERRIDE,
      },
    );

    const cf = new cloudfront.Distribution(this, 'CloudFront', {
      comment: `for ${props.name}-static-site`,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(s3bucket, {
          originAccessControl,
        }),
        compress: true,
        functionAssociations: [
          {
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            function: websiteIndexPageForwardFunction,
          },
        ],
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        viewerProtocolPolicy:
          cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
    });
    s3bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: 'AllowCloudFrontServicePrincipalReadOnly',
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        actions: ['s3:GetObject'],
        resources: [`${s3bucket.bucketArn}/*`],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${cf.distributionId}`,
          },
        },
      }),
    );

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(`${process.cwd()}/../app/out`)],
      destinationBucket: s3bucket,
      destinationKeyPrefix: '/',
      exclude: [
        '.DS_Store',
        '*/.DS_Store',
        '_next/static/wasm/webassembly.wasm',
      ],
    });

    new s3deploy.BucketDeployment(this, 'DeployWebsiteWasm', {
      sources: [
        s3deploy.Source.asset(`${process.cwd()}/../app/out/_next/static/wasm/`),
      ],
      destinationBucket: s3bucket,
      destinationKeyPrefix: '_next/static/wasm/',
      exclude: ['.DS_Store', '*/.DS_Store'],
      contentType: 'application/wasm',
    });

    s3bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:GetObject'],
        principals: [new iam.StarPrincipal()],
        resources: [`${s3bucket.bucketArn}/*`],
      }),
    );
  }
}
