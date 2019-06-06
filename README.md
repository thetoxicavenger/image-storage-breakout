## Learning Objective
* Utilize Heroku addons to leverage Amazon S3 image storage

## Topics
* Redirects, not renders
* Validating file types/sizes
* Flashing messages

## Getting Started
```
heroku create # create heroku project from the command line
# go to https://heroku.com/verify to add a credit card
heroku addons:create bucketeer:hobbyist
# environment variables for s3 bucket are automatically added to your heroku config
# add env vars locally
heroku config:get -s | grep BUCKETEER > .env
npm i --save-dev dotenv
# add dotenv to index.js -> require('dotenv').config()
npm i --save multer # image upload middleware
npm i --save multer-s3
npm i --save aws-sdk # allows us to interact with our storage bucket

npm i --save connect-flash cookie-parser express-session

# install aws CLI
curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip"
unzip awscli-bundle.zip
./awscli-bundle/install -b ~/bin/aws

# list all files in aws s3 bucket
aws s3 ls s3://bucketeer-e9ddbbfa-c913-43ac-af8c-353a7688f2ab

```

## Resources
https://elements.heroku.com/addons/bucketeer
https://devcenter.heroku.com/articles/bucketeer
https://docs.aws.amazon.com/cli/latest/userguide/install-bundle.html#install-bundle-other
https://github.com/expressjs/multer
https://www.npmjs.com/package/multer-s3
https://getbootstrap.com/docs/4.0/components/alerts/