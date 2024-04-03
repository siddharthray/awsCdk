import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as ec2, aws_rds as rds, aws_ecs as ecs, aws_s3 as s3, aws_cloudfront as cloudfront } from 'aws-cdk-lib';


export class MyWoocommerceProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

        // The below code  defines the stack
        // Create a VPC for the infrastructure
        // Create a VPC for the infrastructure
        
        const vpc = new ec2.Vpc(this, 'MyVPC');

        // Create an RDS database
        const database = new rds.DatabaseInstance(this, 'MyDatabase', {
          engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0 }),
          instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
          vpc,
        });

        const cluster = new ecs.Cluster(this, 'MyCluster', {
          vpc,
        });
        
        // Assuming a Docker image for WooCommerce is available
        const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef');

        taskDefinition.addContainer('WooCommerceContainer', {
          image: ecs.ContainerImage.fromRegistry('your-docker-image-here'),
          memoryLimitMiB: 512,
          cpu: 256,
          environment: {
            DATABASE_URL: database.instanceEndpoint.hostname,
          },
        });
        
        const service = new ecs.FargateService(this, 'MyService', {
          cluster,
          taskDefinition,
        });
        
        const bucket = new s3.Bucket(this, 'MyBucket', {
          websiteIndexDocument: 'index.html',
        });
        
        const distribution = new cloudfront.CloudFrontWebDistribution(this, 'MyDistribution', {
          originConfigs: [
            {
              s3OriginSource: {
                s3BucketSource: bucket,
              },
              behaviors : [ {isDefaultBehavior: true}],
            }
          ]
        });
        
        

    
  }
}
