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
*cd into - ..\ChatSystem\ChatProject
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
