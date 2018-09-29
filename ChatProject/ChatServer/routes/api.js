module.exports = function(app, formidable, db) {
    const mg = require('./mongo.js');

    app.post('/api/Upload', (req, res) => {
        mg.Upload(req).then((result) => {
            res.send({'result': 'Success', data: {filename: result}});
        }, (error) => {
            res.send({result: error});
        });
    });

    app.post('/api/Profile', (req, res) => {
       mg.Profile(req).then((result) => {
           res.send({success: true});
       }, (error) => {
           res.send({success: false});
       });
    });

    // Function for authenticating the User
    app.post('/api/UserAuth', (req, res) => {
        mg.UserAuth(req).then((result) => {
            res.send({'result': result});
        }, (error) => {
            res.send({'result': error});
        });
    });

    // Function for returning all the relevant User data
    app.post('/api/UserData', (req, res) => {
        mg.UserData(req).then((result) => {
            res.send({'UserData': result, 'success': true});
        }, (error) => {
            res.send({'UserData': error, 'success': false});
        });
    });

    app.get('/api/Groups', (req, res) => {
        mg.Groups(req).then((result) => {
            res.send({'Groups': result, 'success': true});
        }, (error) => {
            res.send({'Groups': error, 'success': false})
        });
    });

    // Function for returning the group data for a particular group
    app.post('/api/GroupData', (req, res) => {
        mg.GroupData(req).then((result) => {
            res.send({'GroupData': result, 'success': true});
        }, (error) => {
            res.send({'GroupData': error, 'success': false});
        });
    });

    // Function for returning the data for a particular channel
    app.post('/api/ChannelData', (req, res) => {
        mg.ChannelData(req).then((result) => {
            res.send({'channelData': result, 'success': true});
        }, (error) => {
            res.send({'channelData': error, 'success': false});
        });

    });

    // Function for creating a new channel
    app.post('/api/CreateChannel', (req, res) => {
        mg.CreateChannel(req).then((result) => {
            res.send({'result': result});
        }, (error) => {
            res.send({'result': error});
        });
    });

    // Function that hands both user updating and user creation depending on the value of
    // the update boolean parameter
    app.post('/api/UpdateUser', (req, res) => {
        mg.UpdateUser(req).then((result) => {
            res.send({'result': result})
        }, (error) => {
            res.send({'result': error});
        });

    });

    app.post('/api/CreateUser', (req, res) => {
        mg.CreateUser(req).then((result) => {
            res.send({'result': result});
        }, (error) => {
            res.send({'result': error});
        });

    });

    // Function for adding a user to a channel, function creates
    // the user if they doesnt exist
    app.post('/api/AddUserChannel', (req, res) => {
        mg.AddUserChannel(req).then((result) => {
            res.send({'result': result});
        }, (error) => {
            res.send({'result': error});
        });
    });

    // Function for adding a new group
    app.post('/api/AddGroup', (req, res) => {
        mg.AddGroup(req).then((result) => {
            res.send({'result': result});
        }, (error) => {
            res.send({'result': error});
        });
    });

    // Function for deleting a user from a particular channel
    app.post('/api/DelUserChannel', (req, res) => {
        mg.DelUserChannel(req).then((result) => {
            res.send({'result': result});
        }, (error) => {
            res.send({'result': error});
        });
    });

    // Function that deletes a channel
    app.post('/api/DeleteChannel', (req, res) => {
        mg.DeleteChannel(req).then((result) => {
            res.send({success: result});
        }, (error) => {
            res.send({success: error});
        });
    });

    // Function for deleting a group
    app.post('/api/DeleteGroup', (req, res) => {
        mg.DeleteGroup(req).then((result) => {
            res.send({'result': result});
        }, (error) => {
            res.send({'result': error});
        });
    });
}