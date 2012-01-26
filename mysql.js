const MySQL  = require("mysql")
    , LIMIT  = 10000

var client = MySQL.createClient({
  user: 'root',
  database: 'performance_analysis_sequelize'
})

var createTable = function(callback) {
  var sql = "DROP TABLE IF EXISTS `Entries`;CREATE TABLE IF NOT EXISTS `Entries` (`number` INTEGER, `string` VARCHAR(255), `id` INTEGER NOT NULL auto_increment , `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;"
  client.query(sql, function(err, results, fields) {
    if(err) throw new Error(err)
    callback && callback()
  })
}

var testInserts = function(async, testInsertsCallback, disableLogging) {
  createTable(function() {
    var done  = 0
      , start = +new Date()

    var createEntry = function(callback) {
      var sql = "INSERT INTO `Entries` (`number`,`string`,`id`,`createdAt`,`updatedAt`) VALUES (" + Math.floor(Math.random() * 99999) + ",'asdasdad',NULL,'2012-01-24 16:57:51','2012-01-24 16:57:51');"

      client.query(sql, function(err, results, fields) {
        if(err) throw new Error(err)
        callback && callback()
      })
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
  var done  = 0
    , start = +new Date()

  var updateEntry = function(id, callback) {
    var value = Math.floor(Math.random() * 9999999)
    var sql = 'UPDATE `Entries` SET `number`=' + value + ' WHERE id=' + id + ';'
    client.query(sql, function(err, results, fields) {
      if(err) throw new Error(err)
      callback && callback()
    })
  }

  var updateEntryCallback = function() {
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
}

var testRead = function(testReadCallback) {
  var done  = 0
    , start = +new Date
    , sql   = 'SELECT * FROM Entries'

  client = MySQL.createClient({
    user: 'root',
    database: 'performance_analysis_sequelize'
  })

  client.query(sql, function(err, results, fields) {
    if(err) throw new Error(err)

    console.log('Reading ' + results.length + ' database entries took ' + ((+new Date) - start) + 'ms')
    testReadCallback && testReadCallback()
  })
}

var testDelete = function(async, testDeleteCallback) {
  var done  = 0
    , start = +new Date

  var deleteEntry = function(id, callback) {
    var sql = 'DELETE FROM `Entries` WHERE id=' + id + ' LIMIT 1;'

    client.query(sql, function(err, results, fields) {
      if(err) throw new Error(err)
      callback && callback()
    })
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
      deleteEntry(done, deleteEntryCallback)
  } else {
    deleteEntry(done, deleteEntryCallback)
  }
}

testInserts(false, function() {
  testInserts(true, function() {
    testUpdates(false, function() {
      testUpdates(true, function() {
        testRead(function() {
          testDelete(false, function() {
            testDelete(true, function() {
              console.log('Performance tests for mysql-connector done.')
              process.exit()
            })
          })
        })
      })
    })
  })
})
