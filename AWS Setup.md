# AWS Setup Guide:
I found the process rather confusing when I was attempting to get setup uwing their API so I will try my best to make it easy for you to follow here.  
I could make a public account and then you would not need to do this but free AWS accounts have a limited number characters per month, if the limit was hit the tts would not fulfill any other TTS requests.  
This tutorial was created from the steps on Amazon's [getting started](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-browser.html) page and a few other of their sources.  
If you need any help DM me on discord: `kOF.Readie#6594`.
## Step 1: Register a free AWS account
In order to interact with AWS services you need to have setup a developer account, for personal use the free account is perfect.
- Go to the [sign up](https://aws.amazon.com/free/) page and click on `Create a Free Account`.
- Fill in your details: `Email address`, `Password`, `AWS Account name`
- You will then be asked to fill in more information. We will want to set the account type to **Personal**, the rest of the information is for you to fill in by yourself.
- **NOTE** You may be asked to fill out some credentials, this is to verify the AWS account to stop people abusing the free tiers, you will be charged $1 to verify the card and will be refunded in about a week. If you are not asked this, lucky you!
- You will then be asked to confirm your identity with a Text Message or a Voice Call.
- After all verification is complete select the free Support Plan.
- If all went well you should now have an AWS account.
- **NOTE** You may have to wait 24 hours before all AWS services are avaliable to your new account.
## Step 2: Create an Amazon Cognito Identity Pool
- Sign in to the [AWS Services](https://aws.amazon.com/marketplace/management/signin) as **Root User** using the credentials you sed to create your AWS account.
- Then head over to the [Amazon Cognito console](https://eu-west-2.console.aws.amazon.com/cognito/home?region=eu-west-2#).
- Press `Manage Identity Pools` and then choose **Create new identity pool** (if you do not have any identity pools already this step will be skipped).
- Fill out the Identity pool details:  
  `Identity pool name`: 'You choose'  
  `Unauthenticated identities`: checked  
  Leave the rest of the settings at their default
- On the next page open the dropdown `View Details`. **Make a note** of the role name for `unauthenticated identities`.
- Press the `allow` button at the bottom of the page.
- On the next page **set the platform** to `JavaScript`. Then under the `Get AWS Credentials` dropdown **take a note** of the `Identity pool ID` and the `Region`.  
  The details you are looking for should look something like this:
  ```js
  ...region = 'eu-west-2';
  ...IdentityPoolId: 'eu-west-2:2a6e81f2-****-****-****-76206049a562';
  ```
## Step 3: Add a Policy to the Created IAM Role
- Sign in to the AWS Management Console and open the [IAM console](https://console.aws.amazon.com/iam/)
- In the navigation panel on the left of the page, choose **Roles**.
- In the list of IAM roles, click on the link for the unauthenticated identity role we previously made a note of.
- Click on the **Attach policies** button.
- Find and select the checkbox for **AmazonPollyFullAccess**, then press the **Attach policy** button at the bottom of the page.

You should now have setup an AWS account for AWS polly. With the details we have kept a note of go back to the TTS settings page on the [Stream-Chat](https://readiefur.com/stream-chat/) and past in your info, happy TTS-ing!
