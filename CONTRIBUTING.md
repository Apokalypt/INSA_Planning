# Contributing

## Issues

The repo contains templates for bug reporting and new feature request, use them to be sure to provide all the information needed. Take the time to fill up all information before creating the issue...

## Local development
```bash
git clone https://github.com/Apokalypt/INSA_Planning.git
cd INSA_Planning
npm install
```

You can use `npm run dev` to start a local version with nodemon that will catch your changes in order to restart the process each time you make a change.

### Linting

The linting is provided by eslint, where you can find the configuration in the file named `.eslintrc.json` in the root directory. You are free to edit it but make sure that the whole project follow your new rules...

### Environment

The file `.env.example` is a copy of the `.env` file used without value. That means, that you should copy it and fill the missing values.

**IMPORTANT NOTE**: we will not provide you credentials for INSA services - you must have your own!
