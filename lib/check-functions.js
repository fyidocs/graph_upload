

let clients = [
    { id: '1', name: 'Client 1' },
    { id: '2', name: 'Client 2' },
    { id: '3', name: 'Client 3' },
];

module.exports.getClient = (name) => {
    let d = clients.find((d) => d.name === name);
    return new Promise((resolve, reject) => {
        if (d) {
            return resolve(d);
        }
        reject("Not Found")
    });
};

/************************************************/

let groups = [
    { id: '1', name: 'Group 1' },
    { id: '2', name: 'Group 2' },
    { id: '3', name: 'Group 3' },
];

module.exports.getGroup = (name) => {
    let d = groups.find((d) => d.name === name);
    return new Promise((resolve, reject) => {
        if (d) {
            return resolve(d);
        }
        reject("Not Found")
    });
};

/************************************************/

let cabinets = [
    { id: '1', name: 'Cabinet 1' },
    { id: '2', name: 'Cabinet 2' },
    { id: '3', name: 'Cabinet 3' },
];

module.exports.getCabinet = (name) => {
    let d = cabinets.find((d) => d.name === name);
    return new Promise((resolve, reject) => {
        if (d) {
            return resolve(d);
        }
        reject("Not Found")
    });
};