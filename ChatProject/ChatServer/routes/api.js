module.exports = function(app, fs, db) {

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
                        res.send({result: 'ReadFail'});
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

    // Function for adding a user to a channel, function creates
    // the user if they doesnt exist
    app.post('/api/AddUserChannel', (req, res) => {
        var channel = req.body.channel;
        var group = req.body.group;
        var channelName = group + ':' + channel;
        var user = req.body.user;
        var found = false;
        var groupFound = false;

        fs.readFile('routes/Users.json', 'utf8', function(err, data) {
            if (err) {
                console.log(err);
                res.send({success: false});
            } else {
                Database = JSON.parse(data);
                Users = Database[0].Users;
                Groups = Database[1].Groups;
                Channels = Database[2].Channels;

                for (let i = 0; i < Users.length; i++) {
                    if (Users[i].Username === user) {
                        found = true;
                        for (let j = 0; j < Users[i].Groups.length; j++) {
                            if(Users[j].Groups === group) {
                                groupFound = true;
                                break;
                            }
                        }
                        if(!groupFound) {
                            Users[i].Groups.push(group);
                            for (let j = 0; j < Groups.length; j++) {
                                if (Groups[j].Group === group) {
                                    Groups[j].Users.push(user);
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }

                if (!found) {
                    if (group === 'Global') {
                        Users.push({"Username": user, "Email": user +'@mail.com', "UserType": "Normie", "Groups": ["Global", group]});
                    } else {
                        User.push({"Username": user, "Email": user +'@mail.com', "UserType": "Normie", "Groups": [group]});
                    }
                    for (let j = 0; j < Groups.length; j++) {
                        if (Groups[j].Group === group) {
                            Groups[j].Users.push(user);
                            break;
                        }
                    }
                }             

                foundInChannel = false;
                for (let i = 0; i < Channels.length; i++) {
                    if (Channels[i].Channel === channelName) {
                        for (let j = 0; j < Channels[i].Users.length; j++) {
                            if(Channels[i].Users[j] === user) {
                                foundInChannel = true;
                                break;
                            }
                        }       
                        if (!foundInChannel) {
                            Channels[i].Users.push(user);
                        }
                        break;
                    }
                }
                Database[0].Users = Users;
                Database[1].Groups = Groups;
                Database[2].Channels = Channels;

                fs.writeFile("routes/Users.json", JSON.stringify(Database), 'utf8', function(err) {
                    if (err) {
                        console.log(err);
                        res.send({success: false});
                    }
                    res.send({success: true});
                    console.log("Added User: " + channelName + '-' + user);
                });
            }
        })
    });

    // Function for adding a new group
    app.post('/api/AddGroup', (req, res) => {
        var groupName = req.body.groupName;
        var user = req.body.User;
        fs.readFile('routes/Users.json', 'utf8', function(err, data) {
            if (err) {
                console.log(err);
                res.send({result: 'ReadFail'});

            } else {
                Database = JSON.parse(data);
                Users = Database[0].Users;
                Groups = Database[1].Groups;
                
                for (let i = 0; i < Groups.length; i++) {
                    if (Groups[i].Group === groupName) {
                        res.send({result: 'Exists'});
                        return;
                    }
                }
                Groups.push({"Group": groupName, "Users": [user], "Channels": []});
                Database[1].Groups = Groups;
                for (let i = 0; i < Users.length; i++) {
                    if (Users[i].Username === user) {
                        Users[i].Groups.push(groupName);
                        Database[0].Users = Users;
                        break;
                    }
                }
                fs.writeFile("routes/Users.json", JSON.stringify(Database), 'utf8', function(err) {
                    if (err) {
                        console.log(err);
                        res.send({result: 'ReadFail'});
                    }
                    res.send({result: "Success"});
                    console.log("Created Group: " + groupName);
                });
            }
        })
    });

    // Function for deleting a user from a particular channel
    app.post('/api/DelUserChannel', (req, res) => {
        var channel = req.body.channel;
        var group = req.body.group;
        var channelName = group + ':' + channel;
        var user = req.body.user;

        fs.readFile('routes/Users.json', 'utf8', function(err, data) {
            if (err) {
                console.log(err);
                res.send({result: 'Failed'});
            } else {
                Database = JSON.parse(data);
                Channels = Database[2].Channels;
                var found = false;
                for (let i = 0; i < Channels.length; i++) {
                    if (Channels[i].Channel === channelName) {
                        Channels[i].Users = Channels[i].Users.filter(
                            element => element != user)
                        found = true;
                    }
                }
                if (!found) {
                    res.send({result: 'NotExist'});
                }
                Database[2].Channels = Channels;

                fs.writeFile("routes/Users.json", JSON.stringify(Database), 'utf8', function(err) {
                    if (err) {
                        console.log(err);
                        res.send({result: 'Failed'});
                    }
                    res.send({result: 'Success'});
                    console.log("Deleted: " + channelName + '-' + user);
                });
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
        
        fs.readFile('routes/Users.json', 'utf8', function(err, data) {
            if (err) {
                console.log(err);
                res.send({result: 'ReadFail'});

            } else {
                Database = JSON.parse(data);
                Users = Database[0].Users;
                Groups = Database[1].Groups;
                for (let i = 0; i < Groups.length; i++) {
                    if (Groups[i].Group === groupName) {
                        Groups.splice(i, i+1);
                        Database[1].Groups = Groups;
                        break;
                    }
                }

                for (let i = 0; i < Users.length; i++) {
                    for(let j = 0; j < Users[i].Groups.length; j++) {
                        if (Users[i].Groups[j] === groupName) {
                            Users[i].Groups.splice(j, j+1);
                            Database[0].Users = Users;
                            break;
                        }
                    }
                }
                fs.writeFile("routes/Users.json", JSON.stringify(Database), 'utf8', function(err) {
                    if (err) {
                        console.log(err);
                        res.send({result: 'ReadFail'});
                    }
                    res.send({result: "Success"});
                    console.log("Deleted Group: " + groupName);
                })
            }
        });
    });
}