# ChatSystem - 2811ICT Assignment

## Git
The approach to using the git for versioning control was to add and commit the the repository as different functionality was 
completed. That way I could always revert back to an older commit if implementing a new functionallity caused another functionality
to break (luckily it did not occur during development).

### The Git repository is laid out in the following manner:
* ChatProject - The main folder, contains the package.json file for the Angular project called ChatProject as well as:
  * ChatServer - The folder contiaining all of the files for the Server including the package.json for the server.
    * routes 
      * api.js - File which houses all of the REST api functionallity for Server-Client communication.
      * mongo.js - File that contains functions, called my the REST api functions, for accessing the 'Mongo' database to retrieve,               update, delete and remove. 
     * server.js - File that contains the server functionallity for loading the Angular project from its distribution folder.
    
  * src
    * app
      * channel - Folder that contains the channel component, it provides the functionality for chatting, adding and deleting a 
      user from a group, deleting a channel (access to functionality depended on type of user). As well as messaging between other users in the channel
      
      * dash - Folder that contains the dash component, the dashboard for the user, shows the groups and channels the user is a 
      part of as well as buttons for deleting groups, joining groups, creating users and updating users. 
      
      * group - Folder that contains the group component, component that gets created by the dashboard to show details for a
      particular group.
      
      * login - Folder that contains the login component, inital page that accepts a users username and password, if a valid user login was provided the user is sent to the dashboard page.
      
      * create-user - Folder that contains the create user component, a page that allows a super user to create a new user.
      
      * update-user - Folder that contains the update user component, a page that, given a user name loads that users information and allows the super user to update any and all user properties.
   * socket.service.ts - File that is a Service for using sockets for communication between the client and server, used by the Channel component.

### Installation:
To install the project from git:
* clone the repository from 'https://github.com/andrei-iulian/ChatSystem.git'
* cd into - ..\ChatSystem\ChatProject
* call module installation for Angular project - npm install
* rebuild the project distribution - ng build
* cd into - ..\ChatSystem\ChatProject\ChatServer
* call module installation for node server - npm install
* to run call node server.js from inside the 'ChatServer' folder

## Data Structures
The majority of the data structures used were basic, such as strings, numbers, booleans and arrays for storing simple data 
(such as the name of a user, group the user is apart of, if a component has been deleted). Multiple interfaces were created
either for sending data back and forth between the client and users and storing user and channel data locally.
* Dash Component
  * User Interface - UserData: string, success: boolean
  * APIResponse Interface - result: string (exported to Group and Channel)
  * UserDataObject Interface -   Username: string, UserType: string Groups: object

* Group Component
  * GroupData Interface - GroupData: string, success: boolean

* Channel Component
  * ChannelData Interface - channelData: string, success: boolean
  * ChannelResponse Interface - success: boolean
  * ChannelObject Interface - Channel: string, Users: object, Data: object

* Update-User Component
  *  Groups Interface - Groups: string, success: boolean 
  
## Angular Architecture
There are four Angular components: Login, Dash, Group and Channel. The idea behind having these four components instead of just having one component is to modularise the project ensuring that each component handles specific functionality and is understandable (not having 400+ lines of html in one component).The models (data) were mentioned above in the 'Data Structures' heading, similar to the components models were created with the idea of modularity and code reuse were some interfaces are exported to other components expecting similar return values. A service was created for setting up a socket connection with the server so that messages can be passed back and forth between users within each channel.

## REST API Functions

* '/api/Upload' - Function that, given a Form Data object, saves a image into the 'userimages' folder as long as the file type is jpg, jpeg or png.
  * Parameters= form: FormData
  * Return= result: string

* '/api/Profile' - Function for updating a users profile picture within the database given a username and a file name that exists in the 'userimages' folder.
  * Parameters= user: string, file: string
  * Return= success: boolean

* '/api/UserAuth' - Function for authenticating a user login by checking it both the provided username and password belong to a user in the database.
  * Parameters= username: string, password: string
  * Return= result: string

* '/api/UserData' - Function for returning all the relevant User data, the 'UserData' string is a JSON object stringified
  * Parameters= username: string
  * Return= UserData: string, success: boolean
  
* '/api/Groups' - Function that returns all of the Groups within the database so a Super user can update which groups a user is in.
  * Parameters= null
  * Return= Groups: Array<string>

* '/api/GroupData' - Function for returning the group data for a particular group, the 'GroupData' string is a JSON object stringified 
on success, on readFile failure 'GroupData' is blank and on no group by that name 'GroupData' is 'NotFound'
  * Parameters= groupName: string
  * Return= GroupData: string, success: boolean
 
* '/api/ChannelData' - Function for returning the data for a particular channel,  the 'ChannelData' string is a JSON object stringified 
on success, on readFile failure 'ChannelData' is blank
  * Parameters= groupName: string; channel: string
  * Return= ChannelData: string, success: boolean

* '/api/CreateChannel' - Function for creating a new channel, returns 'Fail' on read or write failure, 'Exists' when a channel by that name is already in the group and 'Success' when the channel has been created.
  * Parameters= groups: Array<string>, type: string, user: string, email: string, password: string
  * Return= result: string
 
* '/api/UpdateUser' - Function that handles updating a user returns 'ReadFail' on readFail and writeFail, 'UserExists' when trying to create a user
  * Parameters= group: string, type: string, user: string, update: boolean
  * Return= result: string
  
* '/api/CreateUser' - Function that handles creating a new user.
  * Parameters= groups: Array<string>, type: string, user: string, email: string, password: string
  * Return= result: string
 
* '/api/AddUserChannel' - Function for adding a user to a channel, returns 'false' on failure and 'true' on success
  * Parameters= channel: string, group: string, user: string
  * Return= success: boolean

* '/api/AddGroup' - Function for adding a new group, returns 'ReadFail' on readFail and writeFail, 'Exists' when the given group name already exists, 'Success' when the group was created
  * Parameters= groupName: string, user: string
  * Return= result: string
 
* '/api/DelUserChannel' - Function for deleting a user from a particular channel, returns 'Failed' on readFail and writeFail, 'NotExists' when the user given isn't in the channel, 'Success' when the user was deleted
  * Parameters= channel: string, group: string, user: string
  
  * Return= result: string
  
* '/api/DeleteChannel' - Function that deletes a channel,  returns 'false' on failure and 'true' on deletion success
  * Parameters= group: string, channel: string
 
  * Return= success: boolean
 
* '/api/DeleteGroup' - Function for deleting a group, returns 'ReadFail' on readFail and writeFail, 'Success' on deletion of a group
  * Parameters= groupName: string
 
  * Return= result: string
 
