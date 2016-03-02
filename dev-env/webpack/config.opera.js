import fs from "fs";
import path from "path"
import { execSync } from "child_process";
import webpack from 'webpack';
import _ from 'lodash';
import * as Remove from '../util/remove'
import * as paths from '../paths'
import ManifestPlugin from '../manifest/plugin'

