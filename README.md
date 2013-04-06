## What is this repository about?

mumble mumble

## Setup database first

The tests are using the database `performance_analysis_sequelize` with the user `root` without a password!

## How is it working?

    npm install
    node check-performance.js

    cd rails
    bundle
    ruby sh/performance-test.rb

## Test-results on small vm (1GB Ram, 2 Cores) Centos 5.3 (test ran on 4/5/2013)
    
    node-mysql#insertSerially (2 runs): 1104.5ms
    node-mysql#insertAsync (2 runs): 953ms
    node-mysql#updateSerially (2 runs): 1208ms
    node-mysql#updateAsync (2 runs): 830ms
    node-mysql#read (2 runs): 10ms
    node-mysql#deleteSerially (2 runs): 1000ms
    node-mysql#deleteAsync (2 runs): 492ms

    node-orm#insertSerially (2 runs): 583ms
    node-orm#insertAsync (2 runs): 507ms
    node-orm#updateSerially (2 runs): 585ms
    node-orm#updateAsync (2 runs): 460.5ms
    node-orm#read (2 runs): 16ms
    node-orm#deleteSerially (2 runs): 596ms
    node-orm#deleteAsync (2 runs): 431ms

    persistencejs#insertSerially (2 runs): 1906.5ms
    persistencejs#insertAsync (2 runs): 614.5ms
    persistencejs#updateSerially (2 runs): 1543ms
    persistencejs#updateAsync (2 runs): 13.5ms
    persistencejs#read (2 runs): 614.5ms
    persistencejs#deleteSerially (2 runs): 2051ms
    persistencejs#deleteAsync (2 runs): 597.5ms

    sequelize#insertSerially (2 runs): 2137ms
    sequelize#insertAsync (2 runs): 715ms
    sequelize#updateSerially (2 runs): 2220.5ms
    sequelize#updateAsync (2 runs): 704.5ms
    sequelize#read (2 runs): 22ms
    sequelize#deleteSerially (2 runs): 2353ms
    sequelize#deleteAsync (2 runs): 587.5ms

    no ruby tests...

## Test-results on ec2 micro instance (ami-cb340abf)

    node-mysql#insertSerially (25 runs): 9898.8ms
    node-mysql#insertAsync (25 runs): 9669.96ms
    node-mysql#updateSerially (25 runs): 9610.2ms
    node-mysql#updateAsync (25 runs): 9654.12ms
    node-mysql#read (25 runs): 83.2ms
    node-mysql#deleteSerially (25 runs): 9594.68ms
    node-mysql#deleteAsync (25 runs): 448.6ms

    node-orm#insertSerially (25 runs): 9147.96ms
    node-orm#insertAsync (25 runs): 9097.64ms
    node-orm#updateSerially (25 runs): 8811.08ms
    node-orm#updateAsync (25 runs): 8753.6ms
    node-orm#read (25 runs): 169.88ms
    node-orm#deleteSerially (25 runs): 8686.68ms
    node-orm#deleteAsync (25 runs): 8901.76ms

    persistencejs#insertSerially (25 runs): 26831ms
    persistencejs#insertAsync (25 runs): 11059.24ms
    persistencejs#updateSerially (25 runs): 36069.4ms
    persistencejs#updateAsync (25 runs): 51.12ms
    persistencejs#read (25 runs): 12710.2ms
    persistencejs#deleteSerially (25 runs): 38623.64ms
    persistencejs#deleteAsync (25 runs): 10867.72ms

    sequelize#insertSerially (25 runs): 25763.28ms
    sequelize#insertAsync (25 runs): 10392.8ms
    sequelize#updateSerially (25 runs): 25820.4ms
    sequelize#updateAsync (25 runs): 9892.56ms
    sequelize#read (25 runs): 659.96ms
    sequelize#deleteSerially (25 runs): 25829.32ms
    sequelize#deleteAsync (25 runs): 9807.88ms

    Rails#updateSerially (25 runs): 35896ms
    Rails#updateAsync (25 runs): 36875ms
    Rails#deleteSerially (25 runs): 19027ms
    Rails#read (25 runs): 830ms
    Rails#deleteAsync (25 runs): 23206ms
    Rails#insertSerially (25 runs): 37025ms
    Rails#insertAsync (25 runs): 55269ms
