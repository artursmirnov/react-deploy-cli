const reactDeploy = require('./react-deploy')
const ReadConfigTask = require('../lib/tasks/read-config');
const files       = require('./files');
const chalk       = require('chalk');
const filePath =  'deploy.js'

const s3 = require('react-deploy')
const task = require('../lib/commands/task')
const log = console.log

const projectDesc= {
    root:files.getCurrentDirectoryBase()
}

const key = process.argv[2]
const env = process.argv[3]

var readConfig = new ReadConfigTask({
  project: projectDesc,
  deployTarget: env || 'development',
  deployConfigFile: filePath
});

module.exports = task('activate', () => Promise.resolve()
  .then(() => {
    return readConfig.run().then(function(config){
      const client = s3.createClient({
        s3Options: config.s3,
        useBranchRevisions: config.useBranchRevisions
      })
      
      log()
      
      return client.generateRevisionKey().then(revKey => {
        client.activateRevisions(`index:${key || revKey}`)
        client.activateServiceWorkerRevisions(`service-worker:${key || revKey}`)
      })
    })
  })
)
