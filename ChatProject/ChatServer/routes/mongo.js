module.exports = function (formidable, db) {
    
    function Upload(req) {
        return new Promise((resolve, reject) => {
            var form = new formidable.IncomingForm({ uploadDir: './userimages'});
            form.keepExtenstions = true;
            
            form.onPart = function (part) {
                if(!part.filename || part.filename.match(/\.(jpg|jpeg|png)$/i)) {
                    form.handlePart(part);
                }
                else {
                    console.log(part.filename + ' is not allowed');
                    reject('NotValid');
                }
            }

            form.on('error', (err) => {
                throw err;
                reject("Failed");
            });

            form.on('fileBegin', (name, file) => {
                file.path = form.uploadDir + '/' + file.name;
            });

            form.on('file', (field, file) => {
                resolve(file.name)
            });

            form.parse(req);
        });
    }

    function Profile(req) {
        return new Promise((resolve, reject) => { 
            user = req.body.user;
            file = req.body.file;
            db.collection('Users').updateOne({"Username": user}, {$set: {'Profile': file}}, (err, res) => {
                if (err) {
                    reject(err);
                } else if (res.result.ok) {
                    resolve(true);
                } else {
                    reject(false);
                }
            });
        });
    }

    function UserAuth(req) {
        console.log('HERE');
        return new Promise((resolve, reject) => {
            user = req.body.user;
            pass = req.body.pass;

            db.collection('Users').find({'Username': user, 'Password': pass}).toArray(
                (err, resp) => {
                    if (err) {
                        reject('Failed');
                        console.log(err);
                    }
                    if (!resp[0]) {
                        reject('Failed');
                    } else {
                        resolve('Success');
                    }
                });
        });
    }

    function UserData(req) {
        return new Promise((resolve, reject) => {
            var uname = req.body.username;

            db.collection('Users').find({'Username': uname}).toArray(
                (err, resp) => {
                    if (err) {
                        reject('');
                        return console.log(err);
                    } 
                    resolve(JSON.stringify(resp[0]));
                });

        });
    }

    function Groups(req) {
        return new Promise((resolve, reject) => {
            db.collection('Groups').find({}).toArray(
                (err, resp) => {
                    if (err) {
                       reject('');
                    } else {
                        resolve(JSON.stringify(resp));
                    }
                }
            )
        });
    }

    function GroupData(req) {
        return new Promise((resolve, reject) => {
            var groupName = req.body.groupName;

            db.collection('Groups').find({'Group': groupName}).toArray(
                (err, resp) => {
                    if (err) {
                        reject('');
                        console.log(err);
                    } else if (resp) {
                        resolve(JSON.stringify(resp[0]));
                    } else {
                        reject('NotFound');
                    }
                });
        });
    }

    function ChannelData(req) {
        return new Promise((resolve, reject) => {
            var groupName = req.body.group;
            var channel = req.body.channel;
            var channelName = groupName + ":" + channel;
            
            db.collection('Channels').find({'Channel': channelName}).toArray(
                (err, resp) => {
                    if (err) {
                        reject('');
                        return console.log(err);
                    } else if (resp) {
                        resolve(JSON.stringify(resp[0]));
                    } else {
                        reject('');
                    }
                });
        });
    }

    function CreateChannel(req) {
        return new Promise((resolve, reject) => {
            var groupName = req.body.groupName;
            var channel = req.body.channelName;
            var user = req.body.userName;
            var channelName = groupName + ':' + channel;

            db.collection('Channels').find({'Channel': channelName}).toArray( 
                (err, resp) => {
                    if (err) {
                        reject('Fail');
                        return;
                    } else if (!resp) {
                        reject('Exists');
                        return;
                    } else {
                        db.collection('Channels').insertOne({Channel: channelName, Users: [user], "Data": []},
                        (er, rs) => {
                            if (er) {
                                reject('Fail');
                                return;
                            } else if (rs) {
                                db.collection('Groups').updateOne({Group: groupName}, {$push: {Channels: channel}});
                                resolve('Success');
                            } else {
                                reject('Fail');
                                return;
                            }
                        });
                    }
                }
            );
        });
    }

    function UpdateUser(req) {
        return new Promise((resolve, reject) => {
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
                            reject('NotFound');
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
                        resolve('Success');
                    }
                );   
        });
    }

    function CreateUser(req) {
        return new Promise((resolve, reject) => {            
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
                reject('Fail');
                return;
            }

            db.collection('Users').find({'Username': user}).toArray((err, resp) =>{
                if (resp.length > 0) {
                    reject('Exists');
                } else {
                    db.collection('Users').insertOne({Username: user, Password: password, Email: email, Profile: '', UserType: type,  Groups: groupArray}, (e, r) => {
                        if (e) {
                            reject('Fail');
                            return console.log(e);
                        } else {
                            for (var i = 0; i < groupArray.length; i++) {
                                db.collection("Groups").updateOne({Group: groupArray[i]}, {$addToSet: {'Users': user}});
                            }
                        }
                    })
                    resolve('Success');
                }
            });
        });
    }

    function AddUserChannel(req) {
        return new Promise((resolve, reject) => {
            var channel = req.body.channel;
            var group = req.body.group;
            var channelName = group + ':' + channel;
            var user = req.body.user;
            
            if (!user) {
                reject("NotExist");
                return;
            }
    
            db.collection("Users").find({'Username': user}).toArray((err, resp) => {
                if (err) {
                    reject('Failed');
                } else if(resp[0]) {
                    db.collection("Users").updateOne({'Username': user}, {$addToSet: {'Groups': group}});
                    db.collection('Groups').updateOne({'Group': group}, {$addToSet: {'Users': user}});
                    db.collection('Channels').updateOne({'Channel': channelName}, {$addToSet: {'Users': user}});
                    resolve('Success');
                } else {
                    reject('NotExist');
                }
            });
        });
    }

    function AddGroup(req) {
        return new Promise((resolve, reject) => {
            var groupName = req.body.groupName;
            var user = req.body.User;

            db.collection('Groups').find({'Group': groupName}).toArray((err, resp) => {
                if (err) {
                    reject('ReadFail');
                } else if (resp[0]) {
                    reject('Exists');
                } else {
                    db.collection('Groups').insertOne({'Group': groupName, 'Users': [user], 'Channels': []});
                    db.collection('Users').updateOne({'Username': user}, {$addToSet: {'Groups': groupName}});
                    resolve('Success');
                }
            });
        });
    }

    function DelUserChannel(req) {
        return new Promise((resolve, reject) => {
            var channel = req.body.channel;
            var group = req.body.group;
            var channelName = group + ':' + channel;
            var user = req.body.user;
    
            db.collection('Channels').find({'Channel': channelName, 'Users': user}).toArray((err, resp) => {
                if (err) {
                    reject('Failed');
                } else if (resp[0]) {
                    db.collection('Channels').updateOne({'Channel': channelName}, {$pull: {'Users': user}});
                    resolve('Success');
                } else {
                    reject('NotExist');
                }
            });    
        });
    }

    function DeleteChannel(req) {
        return new Promise((resolve, reject) => {
            var group = req.body.group;
            var channel = req.body.channel;
            var channelName = group + ':' + channel;

            db.collection('Channels').deleteOne({'Channel': channelName},
                (err, resp) => {
                    if (err) {
                        reject(false);
                        return console.log(err);
                    } else {
                        db.collection('Groups').updateOne({Group: group},
                        {"$pull" : {'Channels' : channel}}).then(function(result) {
                            resolve(true);
                        }, function(error) {
                            if (error) {
                                reject(false);
                            }
                        });
                    }
                }
            );
        });
    }

    function DeleteGroup(req) {
        return new Promise((resolve, reject) => {
                
            var groupName = req.body.groupName;
            
            db.collection('Groups').find({'Group': groupName}).toArray((err, resp) => {
                if (err) {
                    reject('ReadFail');
                    console.log(err);
                } else if (resp[0]) {
                    var users = resp[0].Users;
                    for (let i = 0; i < users.length; i++) {
                        db.collection('Users').updateOne({'Username': users[i]}, {$pull: {'Groups': groupName}});
                    }
                    db.collection('Groups').deleteOne({'Group': groupName});
                    resolve('Success');
                } else {
                    reject('NotExist');
                }
            });  
        })
    }

    this.Upload = Upload;
    this.Profile = Profile;
    this.UserAuth = UserAuth;
    this.UserData = UserData;
    this.Groups = Groups;
    this.GroupData = GroupData;
    this.ChannelData = ChannelData;
    this.CreateChannel = CreateChannel;
    this.UpdateUser = UpdateUser;
    this.CreateUser = CreateUser;
    this.AddUserChannel = AddUserChannel;
    this.AddGroup = AddGroup;
    this.DelUserChannel = DelUserChannel;
    this.DeleteChannel = DeleteChannel;
    this.DeleteGroup = DeleteGroup;
    return this;
}