import { createFolder } from "../libs/utils.js";
import {
    writePackage,
    writePass,
    writeReadme,
    writeGitIgnore,
    writeEnv,
    writePrismaSchema,
    writeDocker,
    writeCompose,
    writePrettier,
    writeTSConfig,
    writeDokcerCircle,
    writeCircleConfig,
    writeSetup,
    writeSecretsJSON,
} from "../libs/files.js";

import { join, resolve } from "path";
import chalk from "chalk";
import { exec } from "child_process";
import { existsSync } from "fs";
import fsExtra from "fs-extra";

function init(
    apiname,
    description
) {
    return new Promise(async (resolves, rejects) => {
        try {
            if (existsSync(resolve(apiname))) {
                rejects(`${apiname} already exist`);
            }

            // CREATE FOLDER FOR CREDENTIALS
            createFolder(apiname);
            createFolder(join(apiname, process.env.CONFIG_PATH));
            createFolder(join(apiname, process.env.CONFIG_PATH, "keys"));

            // CREATE FOLDER FOR DB MODEL
            createFolder(join(apiname, "prisma"));

            // CREATE INITIAL FILES
            writePackage(apiname, description);
            writePass(apiname);
            writeReadme(apiname);
            writeGitIgnore(apiname);
            writePrettier(apiname);
            writeEnv(apiname);
            writePrismaSchema(apiname);
            writeTSConfig(apiname);
            writeSecretsJSON(apiname);

            // VERIFY IF CREATE DOCKER FILE
            writeDocker(apiname, description);
            writeCompose(apiname);

            // VERIFY IF CREATE CIRCLECI FILE
            createFolder(join(apiname, ".circleci"));
            writeCircleConfig(apiname);

            // VERIFY IF YARN IS INSTALLED
            exec("yarn --help", { cwd: resolve(apiname) }, (err, stdout, stderr) => {
                if (err) {
                    //IF THERE IS ERROR, INSTALL WITH NPM
                    let npm = exec("npm i", { cwd: resolve(apiname) });
                    console.log(chalk.green.bold("npm install"));
                    npm.stdout.on("data", (data) => {
                        console.log(data);
                    });
                    npm.stderr.on("data", (data) => {
                        console.log(data);
                    });

                    npm.on("exit", finnish);
                } else {
                    //IF YARN CLI EXIST, INSTALL WITH THIS
                    let yarn = exec("yarn install", { cwd: resolve(apiname) });
                    console.log(chalk.green.bold("yarn install"));
                    yarn.stdout.on("data", (data) => {
                        console.log(data);
                    });
                    yarn.stderr.on("data", (data) => {
                        console.log(data);
                    });

                    yarn.on("exit", finnish);
                }
            });

            function finnish() {
                console.log();
                console.log(
                    chalk.green.bold("Finish"),
                    " : ",
                    "API created in ",
                    chalk.yellow.bold(resolve(apiname))
                );
                console.log(
                    chalk.green.bold("Instructions") + " : Go in ",
                    chalk.green.bold(apiname),
                    ", And follow instructions in",
                    chalk.blue.bold("README.md"),
                    "file"
                );
                resolves();
                console.log();
            }
        } catch (error) {
            rejects(error);
        }
    });
}

export default init;