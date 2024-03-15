#!/usr/bin/env node

const fs = require('fs');
const { program } = require('commander')

const {
    log,
    errorLog,
    warningLog,
    primary,
    FILE_NAME } = require('../utils/index')

program
    .version(`${require('../package').version}`)
    .usage('<command> [options]')

program.command('add')
    .description('创建需要记录部署记录的文件名')
    .option('-s, --script <script>', '在check后需要执行的脚本命令，例如 <deploy>')
    .option('-b, --target-branch <branch>', '允许部署的分支名称')
    .action(async (options) => {
        await createFile()
        await updatePaCkageJson(options)
    })

program.commands.forEach(c => c.on('--help', () => console.log()))
program.parse(process.argv)

function createFile(name) {
    try {
        log(primary('初始化记录信息'))
        // 同步地将数据写入文件
        const data = `${new Date().toLocaleString()}      ${name || '初始化'}\n`
        fs.appendFileSync(`./${FILE_NAME}`, data)
        log(primary('create file success'))
    } catch (error) {
        log(errorLog('An error occurred:', error))
        log(errorLog(`------------create fail ---------------`))
        process.exit(1)
    }
}
function updatePaCkageJson(options) {
    try {
        log(primary('读取package.json文件!'))
        const data = fs.readFileSync('./package.json', { encoding: 'utf-8' });
        // 解析JSON数据
        let packageObj = JSON.parse(data);
        // 修改字段
        packageObj.scripts.checkDeploy = `check-deploy ${options.targetBranch}`
        if (!packageObj.scripts[options.script]) {
            log(warningLog(`please add script ${options.script} in package.json`))
            log(errorLog(`------------create fail ---------------`))
            return
        }
        packageObj.scripts[options.script] = `npm run checkDeploy && ${packageObj.scripts[options.script]}`
        // 将修改后的对象转换回JSON字符串
        const updatedPackageJson = JSON.stringify(packageObj, null, 2); // 使用2个空格进行缩进
        log(primary('将更新后的内容写回package.json文件!'))
        fs.writeFileSync('./package.json', updatedPackageJson, { encoding: 'utf-8' })
        log(primary('------------ package.json has been updated! ---------------'))
    } catch (error) {
        log(errorLog('An error occurred:', error))
        log(errorLog(`------------create fail ---------------`))
        process.exit(1)
    }

}