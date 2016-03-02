import fs from 'fs-extra'
import path from 'path'
import _ from 'lodash'

import * as paths from '../../paths'
import * as log from '../log'
import * as Remove from '../../util/remove';
import script from './lib/script'

//const workerProxyPath = 'shared/worker_proxy.html';
const gaPath = "shared/google-analytics-bundle.js";

export default function(manifest, {buildPath}) {

    //const localWorkerProxySrcPath = path.join(paths.src, workerProxyPath);
    const localGaSrcPath = path.join(paths.src, gaPath);
    const scripts = []

    log.pending(`Processing google analytics platform '${localGaSrcPath}'`);

    const buildGaPath = path.join(buildPath, gaPath);
    //const buildWorkerPath = path.join(buildPath, workerPath);

    fs.copySync(localGaSrcPath, buildGaPath);
    //fs.copySync(localWorkerSrcPath, buildWorkerPath);
    //script(workerPath,buildPath);
    //scripts.push(workerPath);
    log.done(`Done`)

    return {manifest, scripts}
}