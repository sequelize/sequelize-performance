const TIMES = 10

var runMySqlTest     = require("./mysql")
  , runNodeOrmTest   = require("./node-orm")
  , runSequelizeTest = require("./sequelize")

var printDurations = function(lib, durations) {
  console.log()

  for(var testName in durations[0]) {
    var sum = 0
      , msg = "{{lib}}#{{testName}} ({{times}} runs): {{duration}}ms"

    durations.forEach(function(res) { sum += res[testName] })

    msg = msg
      .replace('{{lib}}', lib)
      .replace('{{testName}}', testName)
      .replace('{{times}}', durations.length)
      .replace('{{duration}}', sum / durations.length)

    console.log(msg)
  }
}

runMySqlTest(TIMES, function(mySqlDurations) {
  runNodeOrmTest(TIMES, function(nodeOrmDurations) {
    runSequelizeTest(TIMES, function(sequelizeDurations) {
      printDurations('node-mysql', mySqlDurations)
      printDurations('node-orm', nodeOrmDurations)
      printDurations('sequelize', sequelizeDurations)
      process.exit()
    })
  })
})
