module.exports = function(app, fs) {
    app.post('/api/UserData', (req, res) => {
        var uname = req.body.username;
        var Users;
        fs.readFile('routes/Users.json', 'utf8', function(err, data) {
            if (err) {
                console.log(err);
                res.send({'UserData': '', 'success': false});
            } else {
                Database = JSON.parse(data);
                Users = Database[0].Users;
                for (let i = 0; i < Users.length; i++) {
                    if (Users[i].Username === uname) {
                        res.send({'UserData': JSON.stringify(Users[i]), 'success': true});
                        return;
                    }
                }
                res.send({'UserData': 'NotFound', 'success': false});
            }
        })
    });

    app.post('/api/GroupData', (req, res) => {
        var groupName = req.body.groupName;
        var Groups;
        fs.readFile('routes/Users.json', 'utf8', function(err, data) {
            if (err) {
                console.log(err);
                res.send({'GroupData': '', 'success': false});

            } else {
                Database = JSON.parse(data);
                Groups = Database[1].Groups;
                for (let i = 0; i < Groups.length; i++) {
                    if (Groups[i].Group === groupName) {
                        res.send({'GroupData': JSON.stringify(Groups[i]), 'success': true});
                        return;
                    }
                }
                res.send({'GroupData': 'NotFound', 'success': false});
            }
        })
    });

    app.post('/api/ChannelData', (req, res) => {
        var groupName = req.body.group;
        var channel = req.body.channel;
        fs.readFile('routes/Users.json', 'utf8', function(err, data) {
            if(err) {
                console.log(err);
                res.send({channelData: '', success: false});
            } else {
                Database = JSON.parse(data);
                Channels = Database[2].Channels;
                channelName = groupName + ":" + channel;
                for (let i = 0; i < Channels.length; i++) {
                    if(!Channels[i].Channel.localeCompare(channelName)) {
                        res.send({channelData: JSON.stringify(Channels[i]), success: true});
                        return;
                    }
                }
            }
        })
    });

    app.post('/api/CreateChannel', (req, res) => {
        var groupName = req.body.groupName;
        var channel = req.body.channelName;
        var user = req.body.userName;
        var channelName = groupName + ':' + channel;
        fs.readFile('routes/Users.json', 'utf8', function(err, data) {
            if (err) {
                console.log(err);
                res.send({result: 'Fail'});
            } else {
                Database = JSON.parse(data);
                Groups = Database[1].Groups;
                Channels = Database[2].Channels;

                for (let i = 0; i < Channels.length; i++) {
                    if (Channels[i].Channel === channelName) {
                        res.send({result: 'Exists'});
                        return;
                    }
                }
                Channels.push({"Channel": channelName, "Users": [user], "Data": []});
                Database[2].Channels = Channels;

                for (let i = 0; Groups.length; i++) {
                    if (Groups[i].Group === groupName) {
                        Groups[i].Channels.push(channel);
                        Database[1].Groups = Groups;
                        break;
                    }
                }
                fs.writeFile("routes/Users.json", JSON.stringify(Database), 'utf8', function(err) {
                    if (err) {
                        console.log(err);
                        res.send({result: 'Fail'});
                    }
                    res.send({result: "Success"});
                    console.log("Created Channel: " + channelName);
                });
            }
        });
    });

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

    app.post('/api/DeleteChannel', (req, res) => {
        var group = req.body.group;
        var channel = req.body.channel;
        var channelName = group + ':' + channel;

        fs.readFile('routes/Users.json', 'utf8', function(err, data) {
            if (err) {
                console.log(err);
                res.send({success: false});
            } else {
                Database = JSON.parse(data);
                Groups = Database[1].Groups;
                Channels = Database[2].Channels;

                for (let i = 0; i < Groups.length; i++) {
                    if (Groups[i].Group === group) {
                        Groups[i].Channels = Groups[i].Channels.filter(
                            element => element != channel);
                        Database[1].Groups = Groups;
                        break;                        
                    }
                }

                for (let i = 0; i < Channels.length; i++) {
                    if (Channels[i].Channel === channelName) {
                        Channels.splice(i, i+1);
                        Database[2].Channels = Channels;
                        break;
                    }
                }
                fs.writeFile("routes/Users.json", JSON.stringify(Database), 'utf8', function(err) {
                    if (err) {
                        console.log(err);
                        res.send({success: false});
                    }
                    res.send({success: true});
                    console.log("Deleted Channel: " + channelName);
                })
            }
        });
    });

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
                        res.send({result: 'Failed'});
                    }
                    res.send({result: "Success"});
                    console.log("Deleted Group: " + groupName);
                })
            }
        });
    });
}