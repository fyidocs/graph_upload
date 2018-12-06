const request = require('superagent');
const GRAPH_BASEURL = 'https://graph.microsoft.com/v1.0';
const options = require('../options')

/** @module msGraphHelper */

function graphGetRequest(url) {

    if (!url || url[0] !== '/') {
        throw new Error('url must have a leading slash')
    }
    return request
        .get(`${GRAPH_BASEURL}${url}`)
        .set('Authorization', 'Bearer ' + options.token)
        .send()
        .then(response => JSON.parse(response.text));

}



module.exports.getSubItemsById = function (folderId) {
    return graphGetRequest(`/me/drive/items/${folderId}/children`).then(v => v.value)
}

module.exports.getItemById = function (itemId) {
    return graphGetRequest(`/me/drive/items/${itemId}`)
}



module.exports.pipeFileToStream = function (itemId, stream) {
    let outputPipe = request
        .get(`${GRAPH_BASEURL}/me/drive/items/${itemId}/content`)
        .set('Authorization', 'Bearer ' + options.token)
        .on('response', (resp) => {
            if (resp.statusCode != '200') {
                stream.emit('error', new Error("Invalid status code from Ms Graph: " + resp.statusCode));
                stream.end();
                // outputPipe.destroy(new Error("Received status code of " + resp.statusCode));
                return;
            }
        })
        .pipe(stream);
    return outputPipe;
}