import fs from 'fs-extra'
import path from 'path'
import _ from 'lodash'

import * as paths from '../../paths'
import * as log from '../log'
import * as Remove from '../../util/remove';
import script from './lib/script'

const workerProxyPath = 'shared/worker_proxy.html';
const workerPath = 'shared/worker.js';

export default function(manifest, {buildPath}) {
    const {web_accessible_resources} = manifest;

    if(!web_accessible_resources) return;

    const localWorkerProxySrcPath = path.join(paths.src, workerProxyPath);
    const localWorkerSrcPath = path.join(paths.src, workerPath);
    const scripts = []

    log.pending(`Processing web-worker '${localWorkerProxySrcPath}','${localWorkerSrcPath}'`);

    const buildWorkerProxyPath = path.join(buildPath, workerProxyPath);
    //const buildWorkerPath = path.join(buildPath, workerPath);

    fs.copySync(localWorkerProxySrcPath, buildWorkerProxyPath);
    //fs.copySync(localWorkerSrcPath, buildWorkerPath);
    script(workerPath,buildPath);
    scripts.push(workerPath);
    log.done(`Done`)

    return {manifest, scripts}
}