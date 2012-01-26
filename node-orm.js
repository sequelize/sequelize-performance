var server = "mysql://root@localhost/performance_analysis_sequelize"
  , orm    = require("orm")
  , LIMIT  = 10000

orm.connect(server, function(success, db) {
  var Entry = db.define('EntryORM', {
    number: { type: 'integer' },
    string: { type: 'string' }
  })

  var testInserts = function(async, testInsertsCallback, disableLogging) {
    Entry.sync()

    Entry.clear(function() {
      var done  = 0
        , start = +new Date

      var createEntry = function(callback) {
        new Entry({
          number: Math.floor(Math.random() * 99999),
          string: 'asdasd'
        }).save(callback)
      }

      var createEntryCallback = function() {
        if((++done == LIMIT) && !disableLogging)
          console.log('Adding ' + LIMIT + ' database entries ' + (async ? 'async' : 'serially') + ' took ' + ((+new Date) - start) + 'ms')

        if(async) {
          (done == LIMIT) && testInsertsCallback && testInsertsCallback()
        } else {
          if(done < LIMIT)
            createEntry(createEntryCallback)
          else
            testInsertsCallback && testInsertsCallback()
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
      var done  = 0
        , start = +new Date

      var updateEntry = function(index, callback) {
        var entry = entries[index]

        entry.number = Math.floor(Math.random() * 99999)
        entry.save(callback)
      }

      var updateEntryCallback = function(err) {
        if(err) throw new Error(err)

        if(++done == LIMIT)
          console.log('Updating ' + LIMIT + ' database entries ' + (async ? 'async' : 'serially') + ' took ' + ((+new Date) - start) + 'ms')

        if(async) {
          (done == LIMIT) && testUpdatesCallback && testUpdatesCallback()
        } else {
          if(done < LIMIT)
            updateEntry(done, updateEntryCallback)
          else
            testUpdatesCallback && testUpdatesCallback()
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
    var start = +new Date

    Entry.find(function(entries) {
      console.log('Reading ' + entries.length + ' database entries took ' + ((+new Date) - start) + 'ms')
      testReadCallback && testReadCallback()
    })
  }

  var testDelete = function(async, testDeleteCallback) {
    testInserts(true, function() {
      Entry.find(function(entries) {
        var done  = 0
          , start = +new Date

        var deleteEntry = function(index, callback) {
          var entry = entries[index]
          entry.remove(callback)
        }

        var deleteEntryCallback = function() {
          if(++done == LIMIT)
            console.log('Deleting ' + LIMIT + ' database entries ' + (async ? 'async' : 'serially') + ' took ' + ((+new Date) - start) + 'ms')

          if(async) {
            (done == LIMIT) && testDeleteCallback && testDeleteCallback()
          } else {
            if(done < LIMIT)
              deleteEntry(done, deleteEntryCallback)
            else
              testDeleteCallback && testDeleteCallback()
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

  testInserts(false, function() {
    testInserts(true, function() {
      testUpdates(false, function() {
        testUpdates(true, function() {
          testRead(function() {
            testDelete(false, function() {
              testDelete(true, function() {
                console.log('Performance tests for node-orm done.')
                process.exit()
              })
            })
          })
        })
      })
    })
  })
})
