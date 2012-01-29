var persistence      = require('./node_modules/persistencejs/lib/persistence').persistence
  , persistenceStore = require("./node_modules/persistencejs/lib/persistence.store.mysql")

persistenceStore.config(persistence, 'localhost', 3306, 'performance_analysis_sequelize', 'root', null)

var session = persistenceStore.getSession()
  , Entry   = persistence.define('EntryPersistence', {
      number: "INT",
      string: "TEXT"
    })

var testInserts = function(async, testInsertsCallback, disableLogging) {
  session.transaction(function(tx) {
    persistence.schemaSync(tx, function() {
      var done     = 0
        , start    = +new Date
        , duration = null

      var createEntry = function(callback) {
        var entry = new Entry({ number: Math.floor(Math.random() * 99999), string: 'asdasdad' })

        persistence.add(entry)
        persistence.flush(tx, callback)
      }

      var createEntryCallback = function() {
        if((++done == LIMIT) && !disableLogging) {
          duration = (+new Date) - start
          console.log('Adding ' + LIMIT + ' database entries ' + (async ? 'async' : 'serially') + ' took ' + duration + 'ms')
        }

        if(async) {
          (done == LIMIT) && testInsertsCallback && testInsertsCallback(duration)
        } else {
          if(done < LIMIT)
            createEntry(createEntryCallback)
          else
            testInsertsCallback && testInsertsCallback(duration)
        }
      }

      if(async) {
        for(var i = 0; i < LIMIT; i++)
          createEntry(createEntryCallback)
      } else {
        createEntry(createEntryCallback)
      }

    })
  })
}

module.exports = function(times, runCallback) {
  var durations = []
    , done      = 0

  var runTestsOnce = function(callback) {
    console.log('\nRunning mysql tests #' + (done + 1))

    var results = {}

    testInserts(false, function(duration) {
      results.insertSerially = duration

      testInserts(true, function(duration) {
        results.insertAsync = duration

        callback && callback()

        // testUpdates(false, function(duration) {
        //   results.updateSerially = duration

        //   testUpdates(true, function(duration) {
        //     results.updateAsync = duration

        //     testRead(function(duration) {
        //       results.read = duration

        //       testDelete(false, function(duration) {
        //         results.deleteSerially = duration

        //         testDelete(true, function(duration) {
        //           results.deleteAsync = duration

        //           durations.push(results)
        //           callback && callback()
        //         })
        //       })
        //     })
        //   })
        // })
      })
    })
  }

  var runTestsOnceCallback = function() {
    if(++done == times)
      runCallback && runCallback(durations)
    else
      runTestsOnce(runTestsOnceCallback)
  }

  runTestsOnce(runTestsOnceCallback)
}

module.exports(1)
