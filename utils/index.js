const chalk = require('chalk')


const log = console.log
const errorLog = chalk.bold.red
const warningLog = chalk.bold.hex('#FFA500')
const primary = chalk.hex('33E3FF')
const FILE_NAME = 'record.config.txt'

module.exports = {
    log,
    errorLog,
    primary,
    warningLog,
    FILE_NAME
}