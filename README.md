# ChatSystem - 2811ICT Assignment

## Git
The approach to using the git for versioning control was to add and commit the the repository as different functionality was 
completed. That way I could always revert back to an older commit if implementing a new functionallity caused another functionality
to break (luckily it did not occur during development).

### The Git repository is laid out in the following manner:
* ChatProject - The main folder, contains the package.json file for the Angular project called ChatProject as well as:
  * ChatServer - The folder contiaining all of the files for the Server including the package.json for the server.
    * routes - Folder containing the Users.json file that stores all of the User, Group and Channel data. Also contains 
    the api.js file which houses all of the REST api functionallity for Server Client communication.
    
    * server.js - File that contains the server functionallity for loading the Angular project from its distribution folder.
    
  * src
    * app
      * channel - Folder that contains the channel component, it provides the functionality for chatting, adding and deleting a 
      user from a group, deleting a channel (access to functionality depended on type of user).
      
      * dash - Folder that contains the dash component, the dashboard for the user, shows the groups and channels the user is a 
      part of as well as buttons for deleting groups, joining groups, creating users and updating users. 
      
      * group - Folder that contains the group component, component that gets created by the dashboard to show details for a
      particular group.
      
      * login - Folder that contains the login component, inital page that accepts a users username and sends the user to the 
      dashboard (the dashboard sends the user back to the login page if the user doesnt exist).

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
  
## Angular Architecture
There are four Angular components: Login, Dash, Group and Channel. The idea behind having these four components instead of just having one component is to modularise the project ensuring that each component handles specific functionality and is understandable (not having 400+ lines of html in one component).The models (data) were mentioned above in the 'Data Structures' heading, similar to the components models were created with the idea of modularity and code reuse were some interfaces are exported to other components expecting similar return values. No services were implemented as there weren't any that came to mind where it would be requried. When chat communication gets included then a service will likely be created for the socket connection and message passing. 

## REST API Functions

* '/api/UserData' - Function for returning all the relevant User data, the 'UserData' string is a JSON object stringified
  * Parameters= username: string
  * Return= UserData: string, success: boolean

* '/api/GroupData' - Function for returning the group data for a particular group, the 'GroupData' string is a JSON object stringified 
on success, on readFile failure 'GroupData' is blank and on no group by that name 'GroupData' is 'NotFound'
  * Parameters= groupName: string
  * Return= GroupData: string, success: boolean
 
* '/api/ChannelData' - Function for returning the data for a particular channel,  the 'ChannelData' string is a JSON object stringified 
on success, on readFile failure 'ChannelData' is blank
  * Parameters= groupName: string; channel: string
  * Return= ChannelData: string, success: boolean

* '/api/CreateChannel' - Function for creating a new channel, returns 'Fail' on read or write failure, 'Exists' when a channel by that name is already in the group and 'Success' when the channel has been created.
  * Parameters= groupName: string, channel: string, user: string
  * Return= result: string
 
* '/api/UpdateUser' - Function that hands both user updating and user creation depending on the value of the update boolean parameter, returns 'ReadFail' on readFail and writeFail, 'UserExists' when trying to create a user (update is false), 'GroupFailed' when the group passed to the function doesn't exist, 'Success' when creating or updating a user
  * Parameters= group: string, type: string, user: string, update: boolean
  
  * Return= result: string
 
* '/api/AddUserChannel' - Function for adding a user to a channel, function creates the user if they doesnt exist, returns 'false' on failure and 'true' on success
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
 
