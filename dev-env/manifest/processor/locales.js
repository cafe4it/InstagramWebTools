import fs from 'fs-extra'
import path from 'path'
import _ from 'lodash'

import * as paths from '../../paths'
import * as log from '../log'
import * as Remove from '../../util/remove';

const buildLocalesDir = '_locales';
//const localesPath = 'src/_locales';
const processLocales = function(buildPath){
    const localesSrcPath = path.join(paths.src, buildLocalesDir);

    log.pending(`Processing locales '${localesSrcPath}'`);

    const buildLocalesDirPath = path.join(buildPath, buildLocalesDir);
    try{
        const buildLocalesDirStats = fs.lstatSync(buildLocalesDirPath);
        if(!buildLocalesDirStats.isDirectory()){
            fs.mkdirsSync(buildLocalesDirPath);
        }
    }catch(ex){
        fs.mkdirsSync(buildLocalesDirPath);
    }

    fs.copySync(localesSrcPath, buildLocalesDirPath);

    log.done(`Done`)

    return true;
}

export default function(manifest, {buildPath}) {
    processLocales(buildPath);
    return {manifest}
}