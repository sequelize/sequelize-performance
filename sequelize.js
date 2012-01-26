const Sequelize = require("sequelize")
    , LIMIT     = 10000

var sequelize = new Sequelize('performance_analysis_sequelize', 'root', null, { logging: false })
  , Entry     = sequelize.define('Entry', {
      number: Sequelize.INTEGER,
      string: Sequelize.STRING
    })

var testInserts = function(async, testInsertsCallback, disableLogging) {
  var queryChainer = new Sequelize.Utils.QueryChainer()

  Entry.sync({ force: true }).success(function() {
    var start = +new Date

    for(var i = 0; i < LIMIT; i++) {
      var params = { number: Math.floor(Math.random() * 99999), string: 'asdasdad' }

      if(async) {
        queryChainer.add(Entry.create( params ))
      } else {
        queryChainer.add(Entry, 'create', [ params ])
      }
    }

    queryChainer[async ? 'run' : 'runSerially']().success(function() {
      var logTemplate = 'Adding {{limit}} database entries {{executionType}} took {{duration}}ms.'
      var logMessage  = logTemplate
        .replace('{{limit}}', LIMIT)
        .replace('{{executionType}}', async ? 'async' : 'serially')
        .replace('{{duration}}', (+new Date) - start)

      if(!disableLogging)
        console.log(logMessage)

      testInsertsCallback && testInsertsCallback()
    })
  })
}

var testUpdates = function(async, testUpdatesCallback) {
  Entry.all().success(function(entries) {
    var queryChainer = new Sequelize.Utils.QueryChainer()
      , start        = +new Date

    entries.forEach(function(entry) {
      if(async)
        queryChainer.add(entry.updateAttributes({ number: Math.floor(Math.random() * 99999) }))
      else
        queryChainer.add(entry, 'updateAttributes', [{ number: Math.floor(Math.random() * 99999) }])
    })

    queryChainer[async ? 'run' : 'runSerially']().success(function() {
      console.log('Updating ' + LIMIT + ' database entries ' + (async ? 'async' : 'serially') + ' took ' + ((+new Date) - start) + 'ms')
      testUpdatesCallback && testUpdatesCallback()
    }).error(function(errors) {
      console.log(errors)
    })
  })
}

var testRead = function(testReadCallback) {
  Entry.sync().success(function() {
    var start = +new Date

    Entry.all().success(function(entries) {
      console.log('Reading ' + entries.length + ' database entries took ' + ((+new Date) - start) + 'ms')
      testReadCallback && testReadCallback()
    })
  })
}

var testDelete = function(async, testDeleteCallback) {
  testInserts(true, function() {
    Entry.all().success(function(entries) {
      var queryChainer = new Sequelize.Utils.QueryChainer()
        , start        = +new Date

      entries.forEach(function(entry) {
        if(async) {
          queryChainer.add(entry.destroy())
        } else {
          queryChainer.add(entry, 'destroy', [])
        }
      })

      queryChainer[async ? 'run' : 'runSerially']().success(function() {
        var logTemplate = 'Deleting {{limit}} database entries {{executionType}} took {{duration}}ms.'
        var logMessage  = logTemplate
          .replace('{{limit}}', LIMIT)
          .replace('{{executionType}}', async ? 'async' : 'serially')
          .replace('{{duration}}', (+new Date) - start)

        console.log(logMessage)
        testDeleteCallback && testDeleteCallback()
      })
    })
  }, true)
}

testInserts(false, function() {
  testInserts(true, function() {
    testUpdates(false, function() {
      testUpdates(true, function() {
        testRead(function() {
          testDelete(false, function() {
            testDelete(true, function() {
              console.log('Performance tests for Sequelize done.')
            })
          })
        })
      })
    })
  })
})
