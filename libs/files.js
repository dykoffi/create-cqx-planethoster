import ejs from "ejs";
import fs from "fs";
import { join, dirname } from "path";
import CiqlJson from "ciql-json";
import crypto from "crypto";
import random from "random-number";

import { fileURLToPath } from "url";

const iv = crypto.randomBytes(16).toString("base64");
const passiv = crypto.randomBytes(32).toString("base64");

const optionsRM = { min: 10000, max: 65000, integer: true };

const dev_port = random(optionsRM);
const staging_port = random(optionsRM);
const test_port = random(optionsRM);
const app_port = random(optionsRM);
const db_pass = random({ min: 1000, max: 9999, integer: true });

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048, // the length of your key in bits
    publicKeyEncoding: {
        type: "spki", // recommended to be 'spki' by the Node.js docs
        format: "pem",
    },
    privateKeyEncoding: {
        type: "pkcs8", // recommended to be 'pkcs8' by the Node.js docs
        format: "pem",
        cipher: "aes-256-cbc", // *optional*
        passphrase: passiv, // *optional*
    },
});

const __dirname = dirname(fileURLToPath(
    import.meta.url));

export async function writePass(apiname) {
    fs.writeFileSync(
        join(apiname, process.env.CONFIG_PATH, "keys", ".iv.key"),
        iv,
        (err) => {
            err && logError(err.message);
        }
    );
    fs.writeFileSync(
        join(apiname, process.env.CONFIG_PATH, "keys", ".passiv.key"),
        passiv,
        (err) => {
            err && logError(err.message);
        }
    );
    fs.writeFileSync(
        join(apiname, process.env.CONFIG_PATH, "keys", ".pukey.key"),
        publicKey,
        (err) => {
            err && logError(err.message);
        }
    );
    fs.writeFileSync(
        join(apiname, process.env.CONFIG_PATH, "keys", ".prkey.key"),
        privateKey,
        (err) => {
            err && logError(err.message);
        }
    );
}

// WRITE IN PRISMA

export async function writePrismaSchema(apiname) {
    let transFile = await ejs.renderFile(
        join(__dirname, "../templates/prisma/schema.prisma")
    );
    fs.writeFile(join(apiname, "prisma", "schema.prisma"), transFile, (err) => {
        if (err) throw err;
    });
}

// WRITE IN ROOT DIRECTORY

export async function writePackage(apiname, description) {
    CiqlJson.open(join(__dirname, "../templates/package.json"))
        .set("name", apiname.toLowerCase())
        .set("description", description)
        .set(
            "scripts['docker:build']",
            `cqx build && DOCKER_BUILDKIT=1 docker build -t dykoffi/${apiname.toLowerCase()} ./build && rm -rdf build`
        )
        .set("repository.url", `git+https://github.com/author/${apiname}.git`)
        .set("bugs.url", `https://github.com/author/${apiname}/issues`)
        .set("homepage", `git+https://github.com/author/${apiname}#readme`)
        .save(join(apiname, "package.json"));
}

export async function writeEnv(apiname) {
    let transFile = await ejs.renderFile(join(__dirname, "../templates/env"), {
        apiname,
        db_pass,
        dev_port,
    });
    fs.writeFile(join(apiname, ".env"), transFile, (err) => {
        if (err) throw err;
    });
}

export async function writeSecretsJSON(apiname) {
    let transFile = await ejs.renderFile(
        join(__dirname, "../templates/secrets.json")
    );
    fs.writeFile(join(apiname, "secrets.json"), transFile, (err) => {
        if (err) throw err;
    });
}

export async function writeDocker(apiname, description) {
    let transFile = await ejs.renderFile(
        join(__dirname, "../templates/Dockerfile-multiple-staging"), { apiname, description }
    );
    fs.writeFile(join(apiname, "Dockerfile"), transFile, (err) => {
        if (err) throw err;
    });

    let transFile2 = await ejs.renderFile(
        join(__dirname, "../templates/.Dockerignore"), { apiname }
    );
    fs.writeFile(join(apiname, ".Dockerignore"), transFile2, (err) => {
        if (err) throw err;
    });
}

export async function writeCompose(apiname) {
    let transfile = await ejs.renderFile(
        join(__dirname, "../templates/docker-compose.yml"), { dev_port, test_port, staging_port, apiname, db_pass, app_port }
    );
    fs.writeFile(join(apiname, "docker-compose.yml"), transfile, (err) => {
        if (err) throw err;
    });
}

export async function writeReadme(apiname) {
    let transFile = await ejs.renderFile(join(__dirname, "../templates/README"), {
        apiname,
    });
    fs.writeFile(join(apiname, "README.md"), transFile, (err) => {
        if (err) throw err;
    });
}

export async function writeGitIgnore(apiname) {
    let transFile = await ejs.renderFile(
        join(__dirname, "../templates/gitignore")
    );
    fs.writeFile(join(apiname, ".gitignore"), transFile, (err) => {
        if (err) throw err;
    });
}

export async function writeTSConfig(apiname) {
    let transFile = await ejs.renderFile(
        join(__dirname, "../templates/tsconfig.json")
    );
    fs.writeFile(join(apiname, "tsconfig.json"), transFile, (err) => {
        if (err) throw err;
    });
}

export async function writePrettier(apiname) {
    let transFile = await ejs.renderFile(
        join(__dirname, "../templates/prettierrc")
    );
    fs.writeFile(join(apiname, ".prettierrc"), transFile, (err) => {
        if (err) throw err;
    });

    let transFile2 = await ejs.renderFile(
        join(__dirname, "../templates/prettierignore")
    );
    fs.writeFile(join(apiname, ".prettierignore"), transFile2, (err) => {
        if (err) throw err;
    });
}

export async function writeDokcerCircle(apiname) {
    let transFile = await ejs.renderFile(
        join(__dirname, "../templates/Dockerfile-circleci"), { apiname }
    );
    fs.writeFile(join(apiname, "Dockerfile-circleci"), transFile, (err) => {
        if (err) throw err;
    });
}

export async function writeSetup(apiname) {
    let transFile = await ejs.renderFile(join(__dirname, "../templates/setup"), {
        apiname,
    });
    fs.writeFile(join(apiname, "setup.sh"), transFile, (err) => {
        if (err) throw err;
    });
}

// WRITE IN CIRCLECI FOLDER

export async function writeCircleConfig(apiname) {
    let transFile = await ejs.renderFile(
        join(__dirname, "../templates/.circleci/config.yml"), { apiname }
    );
    fs.writeFile(join(apiname, ".circleci/config.yml"), transFile, (err) => {
        if (err) throw err;
    });
}