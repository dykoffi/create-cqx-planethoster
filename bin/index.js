#!/usr/bin/env node

/*This file is the input file of the cqx module. it must not be modified*/

// Import Library

import { Command } from "commander";

// Import Commands

import init from "./init.js";

// Import Commands

import {
    logError,
} from "../libs/utils.js";

//set env variables

process.env.CONFIG_PATH = ".cqx";

const program = new Command();

// Define commands

program
    .argument("<folder>", "Folder where you want to initialize project")
    .description("Initiating a cqx project")
    .option("-d, --description <description>", "Description of the project")
    .action((folder, options) => {
        init(
                folder,
                options.description
            )
            .then(() => {})
            .catch((err) => {
                logError(err);
                process.exit(1);
            })
            .finally(() => {
                setTimeout(() => {
                    process.exit(0);
                }, 500);
            });
    });

program.parse(process.args);