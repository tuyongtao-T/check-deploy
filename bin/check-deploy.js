#!/usr/bin/env node

const { execSync, exec } = require('child_process')
const fs = require('fs')
const readline = require('readline')

const {
    log,
    errorLog,
    primary,
    warningLog,
    FILE_NAME } = require('../utils/index')

// 获取提交人姓名
function getGitUser() {
    try {
        log(primary('获取提交人信息'))
        const name = execSync('git config --get user.name').toString().trim()
        return { name }
    } catch (error) {
        log(errorLog('Error getting git user information:', error))
        return null
    }
}

// 获取当前分支
function getCurrentBranchName() {
    try {
        log(primary('获取分支信息'))
        const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
        return branchName
    } catch (error) {
        log(errorLog('Error getting current branch name:', error))
        return null
    }
}

// 记录部署记录
function recordDeploy(name) {
    try {
        log(primary('写入部署人信息'))
        // 同步地将数据写入文件
        const data = `${new Date().toLocaleString()}      ${name}\n`
        fs.appendFileSync(`./${FILE_NAME}`, data)
    } catch (error) {
        log(errorLog('An error occurred:', error))
        process.exit(1)
    }
}

const fileToCommit = `./${FILE_NAME}`
const commitMessage = 'build: deploy record'

// 执行git add命令

function pushRecord() {
    log(primary('准备提交 add record.config.txt'))
    exec(`git add ${fileToCommit}`, (addErr, addStdout, addStderr) => {
        if (addErr) {
            log(errorLog(`Error adding file: ${addErr}`))
            return
        }
        log(primary('准备提交 commit record.config.txt'))
        // 执行git commit命令
        exec(`git commit -m "${commitMessage}" --no-verify`, (commitErr, commitStdout, commitStderr) => {
            if (commitErr) {
                log(errorLog(`Error committing file: ${commitErr}`))
                return
            }
            log(primary('准备提交 push record.config.txt'))
            // 执行git push命令
            exec('git push', (pushErr, pushStdout, pushStderr) => {
                if (pushErr) {
                    log(errorLog(`Error pushing to repository: ${pushErr}`))
                    return
                }
                log(primary('push record.config.txt 完成'))
            })
        })
    })
}

// 非目标分支  二次确认
function confirmDeployBranch(name) {
    // 创建readline.Interface实例
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    // 询问用户
    log(warningLog('请确认！'))
    rl.question(`你确定要提交${name}分支?，该分支与预设目标不一致 (y/n) `, (answer) => {
        // 处理用户的输入
        if (answer.toLowerCase() === 'y') {
            recordDeploy(gitUser.name)
            pushRecord()
            log(primary('通过检查'))
            // 在这里执行后续操作
        } else {
            log(primary('已终止部署！'))
            process.exit(1)
        }
        // 关闭readline.Interface实例
        rl.close()
    })
}

const arg = process.argv.slice(2)
const targetName = arg[0]

const branchName = getCurrentBranchName()
const gitUser = getGitUser()

try {
    if (branchName !== targetName) {
        confirmDeployBranch(branchName)
    } else {
        recordDeploy(gitUser.name)
        pushRecord()
        log(primary('通过检查'))
    }
} catch (error) {
    log(errorLog('An error occurred:', error))
    process.exit(1)
}

