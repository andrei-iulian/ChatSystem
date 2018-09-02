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
                Groups = Database[0].Groups;
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
}