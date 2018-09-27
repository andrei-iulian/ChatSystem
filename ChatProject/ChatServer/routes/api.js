module.exports = function(app, formidable, db) {

    app.post('/api/Upload', (req, res) => {
        var form = new formidable.IncomingForm({ uploadDir: './userimages'});
        form.keepExtenstions = true;
        
        form.onPart = function (part) {
            if(!part.filename || part.filename.match(/\.(jpg|jpeg|png)$/i)) {
                form.handlePart(part);
            }
            else {
                console.log(part.filename + ' is not allowed');
                res.send({result: 'NotValid'});
            }
        }

        form.on('error', (err) => {
            throw err;
            res.send({result: "Failed"});
        });

        form.on('fileBegin', (name, file) => {
            file.path = form.uploadDir + '/' + file.name;
        });

        form.on('file', (field, file) => {
            res.send({
                result: 'Success',
                data: {'filename': file.name}
            });
        });

        form.parse(req);
    });

    app.post('/api/Profile', (req, res) => {
        user = req.body.user;
        file = req.body.file;
        db.collection('Users').updateOne({"Username": user}, {$set: {'Profile': file}});
        res.send({success: true});
    });

    app.post('/api/ImgMessage', (req, res) => {
        channel = req.body.channel;
        type = req.body.type;
        text = req.body.text;
        image = req.body.image;

        db.collection('Channels').updateOne({'Channel': channel}, {$addToSet: {'Chat': {'type': type, 'text': text, 'image': image}}});
        res.send({success: true});
    });

    // Function for authenticating the User
    app.post('/api/UserAuth', (req, res) => {
        user = req.body.user;
        pass = req.body.pass;

        db.collection('Users').find({'Username': user, 'Password': pass}).toArray(
            (err, resp) => {
                if (err) {
                    res.send({'result': 'Failed'});
                    return console.log(err);
                }
                if (!resp[0]) {
                    res.send({'result': 'Failed'});
                } else {
                    res.send({'result': 'Success'});
                }
            })
    });

    // Function for returning all the relevant User data
    app.post('/api/UserData', (req, res) => {
        var uname = req.body.username;

        db.collection('Users').find({'Username': uname}).toArray(
            (err, resp) => {
                if (err) {
                    res.send({'UserData': '','success': false});
                    return console.log(err);
                } 
                res.send({'UserData': JSON.stringify(resp[0]), 'success': true});
            });
    });

    app.get('/api/Groups', (req, res) => {
        db.collection('Groups').find({}).toArray(
            (err, resp) => {
                if (err) {
                    res.send({'Groups': '', 'success': false});
                } else {
                    res.send({'Groups': JSON.stringify(resp), 'success': true});
                }
            }
        )
    });

    // Function for returning the group data for a particular group
    app.post('/api/GroupData', (req, res) => {
        var groupName = req.body.groupName;
        
        db.collection('Groups').find({'Group': groupName}).toArray(
            (err, resp) => {
                if (err) {
                    res.send({'GroupData': '','success': false});
                    return console.log(err);
                } else if (resp) {
                    res.send({'GroupData': JSON.stringify(resp[0]), 'success': true});
                } else {
                    res.send({'GroupData': 'NotFound', 'success': false});
                }
            });
    });

    // Function for returning the data for a particular channel
    app.post('/api/ChannelData', (req, res) => {
        var groupName = req.body.group;
        var channel = req.body.channel;
        var channelName = groupName + ":" + channel;

         
        db.collection('Channels').find({'Channel': channelName}).toArray(
            (err, resp) => {
                if (err) {
                    res.send({channelData: '', success: false});
                    return console.log(err);
                } else if (resp) {
                    res.send({channelData: JSON.stringify(resp[0]), success: true});
                } else {
                    res.send({channelData: '', success: false});
                }
            });
    });

    // Function for creating a new channel
    app.post('/api/CreateChannel', (req, res) => {
        var groupName = req.body.groupName;
        var channel = req.body.channelName;
        var user = req.body.userName;
        var channelName = groupName + ':' + channel;

        db.collection('Channels').find({'Channel': channelName}).toArray( 
            (err, resp) => {
                if (err) {
                    res.send({result: 'Fail'});
                    return;
                } else if (!resp) {
                    console.log(resp);
                    res.send({result: 'Exists'});
                    return;
                } else {
                    db.collection('Channels').insertOne({Channel: channelName, Users: [user], "Data": []},
                    (er, rs) => {
                        if (er) {
                            res.send({result: 'Fail'});
                            return;
                        } else if (resp) {
                            db.collection('Groups').updateOne({Group: groupName}, {$push: {Channels: channel}});
                            res.send({result: 'Success'});
                        } else {
                            res.send({result: 'Fail'});
                            return;
                        }
                    });
                }
            });
    });

    // Function that hands both user updating and user creation depending on the value of
    // the update boolean parameter
    app.post('/api/UpdateUser', (req, res) => {
        var groups = JSON.parse(req.body.groups);
        var type = req.body.userType;
        var user = req.body.userName;
        var email = req.body.email;
        var password = req.body.password;
        var groupArray = [];

        names = Object.keys(groups);
        
        for (var i = 0; i < names.length; i++) {
            if (groups[names[i]]) {
                groupArray.push(names[i]);
            }
        }
        
        db.collection('Users').updateOne({Username: user}, 
                {$set: {Password: password, Email: email, UserType: type,  Groups: groupArray}}, (error, result) => {
                    if (error) {
                        res.send({result: 'NotFound'});
                        return console.log(error);
                    }

                    for (var i = 0; i < names.length; i++) {
                        if (groups[names[i]]) {
                            db.collection("Groups").updateOne({Group: names[i]}, {$addToSet: {'Users': user}});
                        } else {
                            db.collection("Groups").updateOne({Group: names[i]}, {$pull: {'Users': user}});
                            db.collection("Channels").updateMany({Channel: new RegExp(names[i]+":", 'i')}, {$pull: {'Users': user}});
                        }
                    }
                    res.send({result: 'Success'});
                });   
    });

    app.post('/api/CreateUser', (req, res) => {
        var groups = JSON.parse(req.body.groups);
        var type = req.body.userType;
        var user = req.body.userName;
        var email = req.body.email;
        var password = req.body.password;
        var groupArray = [];

        names = Object.keys(groups);
        
        for (var i = 0; i < names.length; i++) {
            if (groups[names[i]]) {
                groupArray.push(names[i]);
            }
        }

        if(!user) {
            res.send({result: 'Fail'});
            return;
        }

        db.collection('Users').find({'Username': user}).toArray((err, resp) =>{
            if (resp.length > 0) {
                res.send({result: 'Exists'});
            } else {
                db.collection('Users').insertOne({Username: user, Password: password, Email: email, Profile: '', UserType: type,  Groups: groupArray}, (e, r) => {
                    if (e) {
                        res.send({result: 'Fail'});
                        return console.log(e);
                    } else {
                        for (var i = 0; i < groupArray.length; i++) {
                            db.collection("Groups").updateOne({Group: groupArray[i]}, {$addToSet: {'Users': user}});
                        }
                    }
                })
                res.send({result: 'Success'});
            }
        });
    });

    // Function for adding a user to a channel, function creates
    // the user if they doesnt exist
    app.post('/api/AddUserChannel', (req, res) => {
        var channel = req.body.channel;
        var group = req.body.group;
        var channelName = group + ':' + channel;
        var user = req.body.user;
        
        if (!user) {
            res.send({result: "NotExist"});
            return;
        }

        db.collection("Users").find({'Username': user}).toArray((err, resp) => {
            if (err) {
                res.send({result: 'Failed'});
            } else if(resp[0]) {
                db.collection("Users").updateOne({'Username': user}, {$addToSet: {'Groups': group}});
                db.collection('Groups').updateOne({'Group': group}, {$addToSet: {'Users': user}});
                db.collection('Channels').updateOne({'Channel': channelName}, {$addToSet: {'Users': user}});
                res.send({result: 'Success'})
            } else {
                res.send({result: 'NotExist'});
            }
        });
    });

    // Function for adding a new group
    app.post('/api/AddGroup', (req, res) => {
        var groupName = req.body.groupName;
        var user = req.body.User;

        db.collection('Groups').find({'Group': groupName}).toArray((err, resp) => {
            if (err) {
                res.send({result: 'ReadFail'});
            } else if (resp[0]) {
                res.send({result: 'Exists'});
            } else {
                db.collection('Groups').insertOne({'Group': groupName, 'Users': [user], 'Channels': []});
                db.collection('Users').updateOne({'Username': user}, {$addToSet: {'Groups': groupName}});
                res.send({result: 'Success'});
            }
        });
    });

    // Function for deleting a user from a particular channel
    app.post('/api/DelUserChannel', (req, res) => {
        var channel = req.body.channel;
        var group = req.body.group;
        var channelName = group + ':' + channel;
        var user = req.body.user;

        db.collection('Channels').find({'Channel': channelName, 'Users': user}).toArray((err, resp) => {
            if (err) {
                res.send({result: 'Failed'});
            } else if (resp[0]) {
                db.collection('Channels').updateOne({'Channel': channelName}, {$pull: {'Users': user}});
                res.send({result: 'Success'});
            } else {
                res.send({result: 'NotExist'});
            }
        });
    });

    // Function that deletes a channel
    app.post('/api/DeleteChannel', (req, res) => {
        var group = req.body.group;
        var channel = req.body.channel;
        var channelName = group + ':' + channel;

        db.collection('Channels').deleteOne({'Channel': channelName},
            (err, resp) => {
                if (err) {
                    res.send({success: false});
                    return console.log(err);
                } else {
                    db.collection('Groups').update({Group: group},
                    {"$pull" : {'Channels' : channel}}).then(function(result) {
                        res.send({success: true});
                    }, function(error) {
                        if (error) {
                            res.send({success: false});
                        }
                    });
                }
            }
        );
    });

    // Function for deleting a group
    app.post('/api/DeleteGroup', (req, res) => {
        var groupName = req.body.groupName;
        
        db.collection('Groups').find({'Group': groupName}).toArray((err, resp) => {
            if (err) {
                res.send({result: 'ReadFail'});
                console.log(err);
            } else if (resp[0]) {
                var users = resp[0].Users;
                for (let i = 0; i < users.length; i++) {
                    db.collection('Users').updateOne({'Username': users[i]}, {$pull: {'Groups': groupName}});
                }
                db.collection('Groups').deleteOne({'Group': groupName});
                res.send({result: 'Success'})
            } else {
                res.send({result: 'NotExist'});
            }
        });
    });
}