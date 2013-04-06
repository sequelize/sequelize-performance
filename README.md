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
    
    node-mysql#insertSerially (25 runs): 1061.36ms
    node-mysql#insertAsync (25 runs): 912.08ms
    node-mysql#updateSerially (25 runs): 1093.96ms
    node-mysql#updateAsync (25 runs): 819.32ms
    node-mysql#read (25 runs): 9.24ms
    node-mysql#deleteSerially (25 runs): 1069.08ms
    node-mysql#deleteAsync (25 runs): 490.56ms

    node-orm#insertSerially (25 runs): 678ms
    node-orm#insertAsync (25 runs): 584.28ms
    node-orm#updateSerially (25 runs): 628.88ms
    node-orm#updateAsync (25 runs): 528.64ms
    node-orm#read (25 runs): 16.64ms
    node-orm#deleteSerially (25 runs): 663ms
    node-orm#deleteAsync (25 runs): 556.6ms

    persistencejs#insertSerially (25 runs): 2677ms
    persistencejs#insertAsync (25 runs): 2177.84ms
    persistencejs#updateSerially (25 runs): 2656.16ms
    persistencejs#updateAsync (25 runs): 15.8ms
    persistencejs#read (25 runs): 709.48ms
    persistencejs#deleteSerially (25 runs): 4573.24ms
    persistencejs#deleteAsync (25 runs): 799.6ms

    sequelize#insertSerially (25 runs): 2473.76ms
    sequelize#insertAsync (25 runs): 943.88ms
    sequelize#updateSerially (25 runs): 2359.12ms
    sequelize#updateAsync (25 runs): 860.24ms
    sequelize#read (25 runs): 27.32ms
    sequelize#deleteSerially (25 runs): 2090.2ms
    sequelize#deleteAsync (25 runs): 810.32ms

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
