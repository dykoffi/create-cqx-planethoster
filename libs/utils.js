import { existsSync, mkdirSync } from 'fs'
import chalk from 'chalk';
import { join, resolve } from 'path';
import { cwd } from 'process';
import crypto from 'crypto';
import fs from 'fs'

// CREATE FOLDER IF NOT EXIST
export function createFolder(name) {
    if (!existsSync(resolve(name))) {
        mkdirSync(resolve(name))
    }
}

// VERIFY IF WE ARE IN CQX PROJECT
export function verify(callback) {
    if (existsSync(join(cwd(), '.cqx'))) callback()
    else logError("This is not cqx project root")
}

// ENCRYPT DATA
export function crypt(data, algorithm, passiv, iv) {
    let cipher = crypto.createCipheriv(algorithm, passiv, iv)
    let crypted = cipher.update(data, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

export function cryptG(value, folder = join(cwd(), '.cqx', 'keys')) {
    if (value !== null) {
        if (fs.existsSync(join(folder, '.passiv.key')) && fs.existsSync(join(folder, '.iv.key'))) {
            let passiv = fs.readFileSync(join(folder, '.passiv.key')).toString()
            let iv = fs.readFileSync(join(folder, '.iv.key')).toString()
            let Bpassiv = Buffer.from(passiv, 'base64')
            let Biv = Buffer.from(iv, 'base64')
            return crypt(value, 'aes-256-gcm', Bpassiv, Biv)
        } else {
            console.log('keys files not exist');
            return null
        }
    } else {
        return null
    }
}

export function checkVersion(version) {
    return /^[\d]+\.[\d]+\.[\d]+$/.test(version)
}

/**
 * 
 * @param {string} newVersion 
 * @param {string} oldVersion 
 * @returns {boolean}
 */

export function verifyVersion(oldVersion, newVersion) {
    if (checkVersion(newVersion) && checkVersion(oldVersion)) {
        newVersion = newVersion.split(".").map(v => parseInt(v))
        oldVersion = oldVersion.split(".").map(v => parseInt(v))

        if (
            (newVersion[0] > oldVersion[0]) ||
            (newVersion[0] === oldVersion[0] && newVersion[1] > oldVersion[1]) ||
            (newVersion[0] === oldVersion[0] && newVersion[1] === oldVersion[1] && newVersion[2] > oldVersion[2])
        ) {
            return true
        }
        else {
            logError("New version must be great than old version")
            return false
        }
    } else {
        logError("Invalid version")
        return false
    }
}

export function getStatus() {
    if (!existsSync(join(cwd(), "index.ts"))) {
        if (existsSync(join(cwd(), ".cqx/data/", ".release"))) {
            return "built"
        } else {
            return "init"
        }
    } else {
        return "generated"
    }
}

export function verifyState(...states) {
    return states.includes(getStatus())
}

//LOGGING
export function logError(...message) { console.error(chalk.bold.red("Failed"), ...message); }
export function logSuccess(...message) { console.log(chalk.bold.green("Success"), ...message); }
export function logInfo(...message) { console.log(chalk.bold.blueBright("Info"), ...message); }
export function logWarning(...message) { console.log(chalk.bold.yellow("Warning"), ...message); }