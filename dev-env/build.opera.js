// Native
import fs from 'fs-extra';
import { exec } from 'child_process'

// npm
import clc from 'cli-color';

// package
import makeWebpackConfig from './webpack/config';
import webpackBuild from './webpack/build';
import * as paths from './paths'

// Clear release direcotry
fs.removeSync(paths.release);
fs.mkdirSync(paths.release);


