#!/usr/bin/env node
'use strict';

let hasInputFilePath = false;
const program = require('commander');
const drafter = require('drafter.js');
const fs = require('fs');

const validateAction = (err, result) => {
    if (err) {
        console.log(err)
    }

    if (result) {
        console.log("Document has semantic issues!");
        console.dir(result);
    } else {
        console.log("Document is valid with no warnings.");
    }
};

const parseAction = (outputFilePath) => {
    return (err, result) => {
        if (err) {
            console.log(err)
        }

        const data = JSON.stringify(result);

        if (outputFilePath) {
            fs.writeFileSync(outputFilePath, data);
        } else {
            console.info(data);
        }
    };
};

const buildContentFrom = (filename, relativePath = '.') => {
    const inputFilePath = `${relativePath}/${filename}`;
    return fs.readFileSync(inputFilePath).toString();
};

const basicAction = (inputFilePath, progrom) => {
    if (inputFilePath) {
        hasInputFilePath = true;
    }
    const generateSourceMap = !!program.sourcemap;
    const isValidate = !!progrom.validate;
    const requireBlueprintName = true;

    try {
        const content = buildContentFrom(inputFilePath);
        if (isValidate) {
            drafter.validate(content, { requireBlueprintName }, validateAction);
        } else {
            const outputFilePath = progrom.output;

            drafter.parse(content, { generateSourceMap, requireBlueprintName }, parseAction(outputFilePath));
        }
    } catch (e) {
        console.log(e.message);
    }
};

/**
 * CLI
 */
program
    .name('drafter.js-cli')
    .version('1.0.0', '-v, --version')
    .description('API Blueprint Parser by drafter.js')
    .arguments('<input_file>')
    .option('-o, --output <output_file>', 'save output Parse Result into file')
    .option('-s, --sourcemap', 'export sourcemap in the Parse Result')
    .option('-l, --validate', 'validate input only, do not output Parse Result')
    .action(basicAction)
    .parse(process.argv);

if (!hasInputFilePath) {
    program.outputHelp();
}
