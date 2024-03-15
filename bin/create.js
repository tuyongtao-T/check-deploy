#!/usr/bin/env node

const fs = require('fs');
const { program } = require('commander')

program
    .version(`${require('../package').version}`)
    .usage('<command> [options]')

program.command('add')
    .description('创建需要记录部署记录的文件名')
    .option('-s, --script <script>', '在check后需要执行的脚本命令，例如 <deploy>')
    .option('-b, --target-branch <branch>', '允许部署的分支名称')
    .action((options) => {
        createFile()
        updatePaCkageJson(options)
    })


function createFile(name) {
    try {
        log(primary('初始化记录信息'))
        // 同步地将数据写入文件
        const data = `${new Date().toLocaleString()}      ${name || '初始化'}\n`
        fs.appendFileSync(`./${FILE_NAME}`, data)
        log(primary('create file success'))
    } catch (error) {
        log(errorLog('An error occurred:', error))
        process.exit(1)
    }
}
function updatePaCkageJson(options) {
    try {
        // 读取package.json文件
        fs.readFile('package.json', 'utf8', (err, data) => {
            if (err) {
                log(errorLog(`Error reading file: ${err}`))
                return;
            }
            // 解析JSON数据
            let packageObj = JSON.parse(data);
            // 修改字段
            packageObj.script.checkDeploy = `check-deploy ${options.branch}`
            if (!packageObj.script[options.script]) {
                return
            }
            packageObj.script[options.script] = `npm run checkDeploy && packageObj.script[options.script]`
            // 将修改后的对象转换回JSON字符串
            const updatedPackageJson = JSON.stringify(packageObj, null, 2); // 使用2个空格进行缩进
            // 将更新后的内容写回package.json文件
            fs.writeFile('package.json', updatedPackageJson, 'utf8', (err) => {
                if (err) {
                    log(errorLog(`Error writing file: ${err}`))
                } else {
                    log(primary('package.json has been updated!'))
                }
            });
        });
    } catch (error) {
        log(errorLog('An error occurred:', error))
        process.exit(1)
    }

}