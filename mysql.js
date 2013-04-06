const MySQL  = require("mysql")

var LIMIT = 10000

var client = MySQL.createConnection({
  multipleStatements: true,
  host: 'localhost',
  user: 'root',
  database: 'performance_analysis_sequelize'
})

client.connect()

var createTable = function(callback) {
  var sql = "DROP TABLE IF EXISTS `Entries`;CREATE TABLE IF NOT EXISTS `Entries` (`number` INTEGER, `string` VARCHAR(255), `id` INTEGER NOT NULL auto_increment , `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;"
  client.query(sql, function(err, results, fields) {
    if(err) throw new Error(err)
    callback && callback()
  })
}

var testInserts = function(async, testInsertsCallback, disableLogging) {
  createTable(function() {
    var done     = 0
      , start    = +new Date()
      , duration = null

    var createEntry = function(callback) {
      var sql = "INSERT INTO `Entries` (`number`,`string`,`id`,`createdAt`,`updatedAt`) VALUES (" + Math.floor(Math.random() * 99999) + ",'asdasdad',NULL,'2012-01-24 16:57:51','2012-01-24 16:57:51');"

      client.query(sql, function(err, results, fields) {
        if(err) throw new Error(err)
        callback && callback()
      })
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
  var done     = 0
    , start    = +new Date()
    , duration = null

  var updateEntry = function(id, callback) {
    var value = Math.floor(Math.random() * 9999999)
    var sql = 'UPDATE `Entries` SET `number`=' + value + ' WHERE id=' + id + ';'
    client.query(sql, function(err, results, fields) {
      if(err) throw new Error(err)
      callback && callback()
    })
  }

  var updateEntryCallback = function() {
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
}

var testRead = function(testReadCallback) {
  var done     = 0
    , start    = +new Date
    , sql      = 'SELECT * FROM Entries'
    , duration = null

  client.query(sql, function(err, results, fields) {
    if(err) throw new Error(err)

    duration = (+new Date) - start
    console.log('Reading ' + results.length + ' database entries took ' + duration + 'ms')
    testReadCallback && testReadCallback(duration)
  })
}

var testDelete = function(async, testDeleteCallback) {
  testInserts(false, function() {
    var done     = 0
      , start    = +new Date()
      , duration = null

    var deleteEntry = function(id, callback) {
      var sql = 'DELETE FROM `Entries` WHERE id=' + id + ' LIMIT 1;'

      client.query(sql, function(err, results, fields) {
        if(err) throw new Error(err)
        callback && callback()
      })
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
        deleteEntry(done, deleteEntryCallback)
    } else {
      deleteEntry(done, deleteEntryCallback)
    }
  }, true)
}

module.exports = function(times, limit, runCallback) {
  var durations = []
    , done      = 0

  LIMIT = limit

  var runTestsOnce = function(callback) {
    console.log('\nRunning mysql tests #' + (done + 1))

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
