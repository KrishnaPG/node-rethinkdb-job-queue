# Introduction

`rethinkdb-job-queue` is a persistent job or task queue backed by [RethinkDB][rethinkdb-url].
It has been build as an alternative to using a [Redis][redis-url] backed job queue such as [Kue][kue-url], [Bull][bull-url], or [Bee-Queue][bee-queue-url].

[![bitHound Overall Score][bithound-overall-image]][bithound-overall-url]
[![bitHound Dependencies][bithound-dep-image]][bithound-dep-url]
[![bitHound Dependencies][bithound-code-image]][bithound-code-url]
[![js-standard-style][js-standard-image]][js-standard-url]

[![Thinker][thinker-image]][rjq-github-url]

[![NPM][nodei-npm-image]][nodei-npm-url]

Please __Star__ on GitHub / NPM and __Watch__ for updates.

## Documentation

__Warning:__ This is early days for `rethinkdb-job-queue`. The API will change and documentation is sparse. That said, there are over 1100 integration tests and it is fully functional.

For full documentation of the `rethinkdb-job-queue` package, please see the [wiki][rjq-wiki-url]

## Quick Start

### Installation

```sh
npm install rethinkdb-job-queue --save
```

### Simple Example

```js

const Queue = require('rethinkdb-job-queue')
const options = {
  db: 'JobQueue', // The name of the database in RethinkDB
  name: 'Mathematics' // The name of the table in the database
}

const q = new Queue(options)

const job = q.createJob()
job.numerator = 123
job.denominator = 456

q.process((job, next) => {
    try {
      let result = job.numerator / job.denominator
      next(null, result)
    } catch (err) {
      console.error(err)
      next(err)
    }
})

return q.addJob(job).catch((err) => {
  console.error(err)
})

```

### E-Mail Job Example using [nodemailer][nodemailer-url]

```js

// The following is not related to rethinkdb-job-queue
// nodemailer configuration
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  service: 'Mailgun',
  auth: {
    user: 'postmaster@your-domain-here.com',
    pass: 'your-api-key-here'
  }
})

// Setup e-mail data with unicode symbols
var mailOptions = {
  from: '"Registration" <support@superheros.com>', // Sender address
  subject: 'Registration', // Subject line
  text: 'Click here to complete your registration', // Plaintext body
  html: '<b>Click here to complete your registration</b>' // HTML body
}

// rethinkdb-job-queue configuration
const Queue = require('rethinkdb-job-queue')

// Queue options have defaults and are not required
const options = {
  db: 'JobQueue', // The name of the database in RethinkDB
  name: 'RegistrationEmail', // The name of the table in the database
  host: 'localhost',
  port: 28015,
  masterInterval: 300, // Database review period in seconds
  changeFeed: true, // Enables events from the database table
  concurrency: 100,
  removeFinishedJobs: 30, // true, false, or number of days.
}

// This is the main queue instantiation call
const q = new Queue(options)

// Customizing the default job options for new jobs
const jobDefaults = {
  priority: 'normal',
  timeout: 300,
  retryMax: 3, // Four attempts, first then three retries
  retryDelay: 600 // Time in seconds to delay retries
}
q.jobOptions = jobDefaults

const job = q.createJob()
// The createJob method will only create the job locally.
// It will need to be added to the queue.
// You can decorate the job with any data to be saved for processing
job.recipient = 'batman@batcave.com'

q.process((job, next) => {
  // Send email using job.to as the destination address
  mailOptions.to = job.recipient
  transporter.sendMail(mailOptions).then((info) => {
    console.dir(info)
    next(null, info)
  }).catch((err) => {
    next(err)
  })
})

return q.addJob(job).then((savedJobs) => {
  // savedJobs is an array of the jobs added with updated properties
}).catch((err) => {
  console.error(err)
})

```

## Contributing

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Commit your changes: `git commit -am 'Add some feature'`
4.  Push to the branch: `git push origin my-new-feature`
5.  Submit a pull request :D

## Credits

Thanks to the following marvelous packages and people for their hard work:

-   The [RethinkDB][rethinkdb-url] team for the great database.
-   The RethinkDB driver [rethinkdbdash][rethinkdbdash-url] by [Michel][neumino-url]
-   The Promise library [Bluebird][bluebird-url] by [Petka Antonov][petka-url].
-   The date management library [moment][moment-url].
-   The UUID package [node-uuid][uuid-url] by [Robert Kieffer][broofa-url].

This list could go on...

## License

MIT

[redis-url]: http://redis.io/
[kue-url]: http://automattic.github.io/kue/
[bull-url]: https://github.com/OptimalBits/bull
[bee-queue-url]: https://github.com/LewisJEllis/bee-queue
[rethinkdb-url]: http://www.rethinkdb.com/
[rethinkdbdash-url]: https://github.com/neumino/rethinkdbdash
[neumino-url]: https://github.com/neumino
[rjq-github-url]: https://github.com/grantcarthew/node-rethinkdb-job-queue
[rjq-wiki-url]: https://github.com/grantcarthew/node-rethinkdb-job-queue/wiki
[thinker-image]: https://cdn.rawgit.com/grantcarthew/node-rethinkdb-job-queue/master/thinkerjoblist.png
[nodemailer-url]: https://www.npmjs.com/package/nodemailer
[bluebird-url]: https://github.com/petkaantonov/bluebird
[petka-url]: https://github.com/petkaantonov
[moment-url]: http://momentjs.com/
[uuid-url]: https://github.com/broofa/node-uuid
[broofa-url]: https://github.com/broofa
[bithound-overall-image]: https://www.bithound.io/github/grantcarthew/node-rethinkdb-job-queue/badges/score.svg
[bithound-overall-url]: https://www.bithound.io/github/grantcarthew/node-rethinkdb-job-queue
[bithound-dep-image]: https://www.bithound.io/github/grantcarthew/node-rethinkdb-job-queue/badges/dependencies.svg
[bithound-dep-url]: https://www.bithound.io/github/grantcarthew/node-rethinkdb-job-queue/master/dependencies/npm
[bithound-code-image]: https://www.bithound.io/github/grantcarthew/node-rethinkdb-job-queue/badges/code.svg
[bithound-code-url]: https://www.bithound.io/github/grantcarthew/node-rethinkdb-job-queue
[js-standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[js-standard-url]: http://standardjs.com/
[nodei-npm-image]: https://nodei.co/npm/rethinkdb-job-queue.png?downloads=true&downloadRank=true&stars=true
[nodei-npm-url]: https://nodei.co/npm/rethinkdb-job-queue/
