const persistence      = require('persistencejs/lib/persistence').persistence
    , persistenceStore = require("persistencejs/lib/persistence.store.mysql")

var LIMIT = 10000

persistence.debug = false
persistenceStore.config(persistence, 'localhost', 3306, 'performance_analysis_sequelize', 'root', null)

var session = persistenceStore.getSession()
  , Entry   = persistence.define('EntryPersistence', {
      number: "INT",
      string: "TEXT"
    })

var testInserts = function(async, testInsertsCallback, disableLogging) {
  session.transaction(function(tx) {
    persistence.reset(tx, function() {
      persistence.schemaSync(tx, function() {
        var done     = 0
          , start    = +new Date
          , duration = null

        var createEntry = function(callback) {
          var entry = new Entry({ number: Math.floor(Math.random() * 99999), string: 'asdasdad' })

          persistence.add(entry)
          if(async)
            callback && callback()
          else
            persistence.flush(tx, callback)
        }

        var createEntryCallback = function() {
          if((++done == LIMIT) && !async && !disableLogging) {
            duration = (+new Date) - start
            console.log('Adding ' + LIMIT + ' database entries ' + (async ? 'async' : 'serially') + ' took ' + duration + 'ms')
          }

          if(async) {
            if (done == LIMIT) {
              persistence.flush(tx, function() {
                duration = (+new Date) - start
                console.log('Adding ' + LIMIT + ' database entries ' + (async ? 'async' : 'serially') + ' took ' + duration + 'ms')
                testInsertsCallback && testInsertsCallback(duration)
              })
            }
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
  })
}

var testUpdates = function(async, testUpdatesCallback) {
  session.transaction(function(tx) {
    var localLimit = async ? LIMIT : 500

    localLimit = (LIMIT < localLimit) ? LIMIT : localLimit

    Entry.all(session).limit(localLimit).list(function(entries) {
      var done     = 0
        , start    = +new Date()
        , duration = null

      var updateEntry = function(index, callback) {
        var entry = entries[index]
        entry.number = Math.floor(Math.random() * 9999999)

        if(async)
          callback && callback()
        else
          persistence.flush(tx, callback)
      }

      var updateEntryCallback = function() {
        if((++done == localLimit) && !async) {
          duration = ((+new Date) - start) * (LIMIT / localLimit)
          console.log('Updating ' + LIMIT + ' database entries ' + (async ? 'async' : 'serially') + ' took ~' + duration + 'ms')
        }

        if(async) {
          if(done == localLimit) {
            persistence.flush(tx, function() {
              duration = (+new Date) - start
              console.log('Updating ' + LIMIT + ' database entries ' + (async ? 'async' : 'serially') + ' took ' + duration + 'ms')
              testUpdatesCallback && testUpdatesCallback(duration)
            })
          }
        } else {
          if(done < localLimit)
            updateEntry(done, updateEntryCallback)
          else
            testUpdatesCallback && testUpdatesCallback(duration)
        }
      }

      if(async) {
        for(var i = 0; i < localLimit; i++)
          updateEntry(i, updateEntryCallback)
      } else {
        updateEntry(0, updateEntryCallback)
      }
    })
  })
}

var testRead = function(testReadCallback) {
  session.transaction(function(tx) {
    var start    = +new Date
      , duration = null

    Entry.all(session).list(function(results) {
      duration = (+new Date) - start
      console.log('Reading ' + results.length + ' database entries took ' + duration + 'ms')
      testReadCallback && testReadCallback(duration)
    })
  })
}

var testDelete = function(async, testDeleteCallback) {
  testInserts(true, function() {
    session.transaction(function(tx) {
      Entry.all(session).list(function(entries) {
        var done     = 0
          , start    = +new Date()
          , duration = null

        var deleteEntry = function(index, callback) {
          var entry = entries[index]
          persistence.remove(entry)
          if(async)
            callback && callback()
          else
            persistence.flush(tx, callback)
        }

        var deleteEntryCallback = function() {
          if((++done == LIMIT) && !async) {
            duration = (+new Date) - start
            console.log('Deleting ' + LIMIT + ' database entries ' + (async ? 'async' : 'serially') + ' took ' + duration + 'ms')
          }

          if(async) {
            if(done == LIMIT) {
              persistence.flush(tx, function() {
                duration = (+new Date) - start
                console.log('Deleting ' + LIMIT + ' database entries ' + (async ? 'async' : 'serially') + ' took ' + duration + 'ms')
                testDeleteCallback && testDeleteCallback(duration)
              })
            }
          } else {
            if(done < LIMIT)
              deleteEntry(done, deleteEntryCallback)
            else
              testDeleteCallback && testDeleteCallback(duration)
          }
        }

        if(async) {
          for(var i = 0; i < LIMIT; i++)
            deleteEntry(done, deleteEntryCallback)
        } else {
          deleteEntry(done, deleteEntryCallback)
        }
      })
    })
  }, true)
}

module.exports = function(times, limit, runCallback) {
  var durations = []
    , done      = 0

  LIMIT = limit

  var runTestsOnce = function(callback) {
    console.log('\nRunning persistencejs tests #' + (done + 1))

    var results = {}

    testInserts(false, function(duration) {
      results.insertSerially = duration

      testInserts(true, function(duration) {
        results.insertAsync = duration

        testUpdates(false, function(duration) {
          results.updateSerially = duration

          testUpdates(true, function(duration) {
            results.updateAsync = duration

            testRead(function(duration) {
              results.read = duration

              testDelete(false, function(duration) {
                results.deleteSerially = duration

                testDelete(true, function(duration) {
                  results.deleteAsync = duration

                  durations.push(results)
                  callback && callback()
                })
              })
            })
          })
        })
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
