'use strict';

const GitHub = require('github-api');
const Fs = require('fs');
const Async = require('async');

const internals = {};

// Load modules
exports.writeOrgDotFile = function (orgName, githubUri, outputFile, auth, next) {

    internals.auth = auth;
    internals.indexPackageJsons(orgName, githubUri, (err, pckJsons) => {

        if (err) {
            return next(err);
        }

        try {

            const ws = Fs.createWriteStream(outputFile);
            ws.write('digraph finite_state_machine {\n');
            const pckNames = Object.keys(pckJsons);
            pckNames.forEach( (pckName) => {

                const pckJson = pckJsons[pckName];

                internals.writeDependencies(ws, pckName, pckJson.dependencies, pckNames);
                internals.writeDependencies(ws, pckName, pckJson.devDependencies, pckNames, '[style=dotted]');
            });
            setTimeout(function () {
                ws.end('}\n');
                return next(null, outputFile);
            }, 1000);
        }
        catch (err) {
            return next(err);
        }
    });
};

internals.writeDependencies = function (ws, pckName, dependencies, relevantPackages, dotOptions) {

    if (!dependencies) {
        ws.write(`"${internals.repoName(pckName)}";\n`);
    }
    else {
        let hasInternalDependencies = false;
        Object.keys(dependencies).forEach( (depName) => {

            if (relevantPackages.indexOf(depName) > 0) {
                let line = `"${internals.repoName(pckName)}" -> "${internals.repoName(depName)}"`;
                if (dotOptions) {
                    line += dotOptions;
                }
                line += `;\n`;
                ws.write(line);
                hasInternalDependencies = true;
            }
        });
        if (!hasInternalDependencies) {
            ws.write(`"${internals.repoName(pckName)}";\n`);
        }
    }
};

internals.repoName = (f) => f.split('/').pop();

internals.indexPackageJsons = function (orgName, githubUri, next) {

    const pckJsons = { };

    try {
        const gh = new GitHub(internals.auth, githubUri);
        const org = gh.getOrganization(orgName);

        org.getRepos((err, repos) => {

            if (err) {
                next(err);
            };

            Async.each(repos,
                (repoMeta, callback) => {

                    try {
                        const repo = gh.getRepo(orgName, repoMeta.name);
                        repo.getContents('master', 'package.json', true, (err, result) => {

                            if (err && err.response.status !== 404) {
                                return next(err);
                            }

                            if (result) {
                                pckJsons[result.name] = result;
                            }
                            return callback();
                        });
                    }
                    catch (err){
                        return next(err);
                    }

                },
                (err) => {

                    if (err) {
                        return next(err);
                    }
                    return next(null, pckJsons);
                });
        });
    }
    catch (err) {
        next(err);
    }
};
