import _ from 'lodash';
import unirest from 'unirest';

export default function(href){
    var req = unirest.get(href);
    console.log(req);
}
