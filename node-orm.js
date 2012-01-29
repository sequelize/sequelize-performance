var server = "mysql://root@localhost/performance_analysis_sequelize"
  , orm    = require("orm")
  , LIMIT  = 10000

module.exports = function(times, limit, runCallback) {
  var durations = []
    , done      = 0

  LIMIT = limit

  var runTestsOnce = function(callback) {
    orm.connect(server, function(success, db) {
      var Entry = db.define('EntryORM', {
        number: { type: 'integer' },
        string: { type: 'string' }
      })

      var testInserts = function(async, testInsertsCallback, disableLogging) {
        Entry.sync()

        Entry.clear(function() {
          var done     = 0
            , start    = +new Date()
            , duration = null

          var createEntry = function(callback) {
            new Entry({
              number: Math.floor(Math.random() * 99999),
              string: 'asdasd'
            }).save(callback)
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
      }

      var testUpdates = function(async, testUpdatesCallback) {
        Entry.find(function(entries) {
          var done     = 0
            , start    = +new Date()
            , duration = null

          var updateEntry = function(index, callback) {
            var entry = entries[index]

            entry.number = Math.floor(Math.random() * 99999)
            entry.save(callback)
          }

          var updateEntryCallback = function(err) {
            if(err) throw new Error(err)

            if(++done == LIMIT) {
              duration = (+new Date) - start
              console.log('Updating ' + LIMIT + ' database entries ' + (async ? 'async' : 'serially') + ' took ' + duration + 'ms')
            }

            if(async) {
              (done == LIMIT) && testUpdatesCallback && testUpdatesCallback(duration)
            } else {
              if(done < LIMIT)
                updateEntry(done, updateEntryCallback)
              else
                testUpdatesCallback && testUpdatesCallback(duration)
            }
          }

          if(async) {
            for(var i = 0; i < LIMIT; i++)
              updateEntry(i, updateEntryCallback)
          } else {
            updateEntry(0, updateEntryCallback)
          }
        })
      }

      var testRead = function(testReadCallback) {
        var start    = +new Date
          , duration = null

        Entry.find(function(entries) {
          duration = (+new Date) - start
          console.log('Reading ' + entries.length + ' database entries took ' + duration + 'ms')
          testReadCallback && testReadCallback(duration)
        })
      }

      var testDelete = function(async, testDeleteCallback) {
        testInserts(true, function() {
          Entry.find(function(entries) {
            var done     = 0
              , start    = +new Date()
              , duration = null

            var deleteEntry = function(index, callback) {
              var entry = entries[index]
              entry.remove(callback)
            }

            var deleteEntryCallback = function() {
              if(++done == LIMIT) {
                duration = (+new Date) - start
                console.log('Deleting ' + LIMIT + ' database entries ' + (async ? 'async' : 'serially') + ' took ' + duration + 'ms')
              }

              if(async) {
                (done == LIMIT) && testDeleteCallback && testDeleteCallback(duration)
              } else {
                if(done < LIMIT)
                  deleteEntry(done, deleteEntryCallback)
                else
                  testDeleteCallback && testDeleteCallback(duration)
              }
            }

            if(async) {
              for(var i = 0; i < LIMIT; i++)
                deleteEntry(i, deleteEntryCallback)
            } else {
              deleteEntry(0, deleteEntryCallback)
            }
          })
        }, true)
      }

      console.log('\nRunning node-orm tests #' + (done + 1))

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
