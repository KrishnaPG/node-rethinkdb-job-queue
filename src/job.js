const EventEmitter = require('events').EventEmitter
const uuid = require('node-uuid')
const moment = require('moment')
const jobMessages = require('./job-messages')
const priorities = require('./enums').priorities
const dbJob = require('./db-job')

class Job extends EventEmitter {

  constructor (q, data, options) {
    super()
    this.q = q

    // If creating a job from the database, pass the job data as the options.
    // Eg. new Job(queue, null, jobData)
    if (options.id) {
      Object.assign(this, options)
    } else {
      let now = moment().toDate()
      this.id = uuid.v4()
      this.data = data || {}
      this.priority = options.priority
      this.timeout = options.timeout
      this.retryDelay = options.retryDelay
      this.retryMax = options.retryMax
      this.progress = 0
      this.retryCount = 0
      this.status = 'waiting'
      this.log = []
      this.dateCreated = now
      this.dateModified = now
      this.dateFailed
      this.dateStarted
      this.dateHeartbeat = now
      this.heartbeatIntervalId
      this.dateStalled
      this.duration
      this.workerId
    }
  }

  enableEvents () {
    return this.q.ready.then(() => {
      return this.q.r.table(this.name).get(this.id)
      .changes().run().then((feed) => {
        feed.each((err, change) => {
          jobMessages(err, change).bind(this)
        })
      })
    })
  }

  startHeartbeat () {
    return setInterval(() => {
      console.log('Heartbeat: ' + this.id)
      return this.q.r.table(this.q.name).get(this.id)
        .update({ dateHeartbeat: moment().toDate() }).run()
    }, this.timeout / 2)
  }

  stopHeartbeat () {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId)
    }
  }

  get cleanCopy () {
    const jobCopy = Object.assign({}, this)
    jobCopy.priority = priorities[jobCopy.priority]
    delete jobCopy._events
    delete jobCopy._eventsCount
    delete jobCopy.domain
    delete jobCopy.q
    delete jobCopy.heardbeatIntervalId
    return jobCopy
  }

  // setStatus (status) { :TODO: ??
  //   dbJob.setStatus(this.q, status)
  // }
}

module.exports = Job
