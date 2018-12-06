# Running

1. Create a file options.js in the root (see options.sample.js for example of content)
2. do `npm install`
3. Run index.js


# Notes
1. All async opterations relating to directory structure creation are performed single request at a time
2. Upload to S3 is performed as concurrent requests. To modify the number of concurrent request, set the value for `CONCURRENT_FILE_TRANSFERS` in `options.js` 





# Get MS Graph Access Token

https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=1229b9d9-685c-4008-8e44-4be68db091c0&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%2Fmyapp&response_mode=query&scope=offline_access%20user.read%20files.read%20files.read.all%20files.read.selected&state=12345



POST 
https://login.microsoftonline.com/common/oauth2/v2.0/token?client_id=1229b9d9-685c-4008-8e44-4be68db091c0
&scope=offline_access%20user.read%20files.read%20files.read.all%20files.read.selected
&code=d
&redirect_uri=http%3A%2F%2Flocalhost%2Fmyapp
&grant_type=authorization_code
&client_secret=[secret]

# Useful Links


1. drive item resource type: https://docs.microsoft.com/en-us/onedrive/developer/rest-api/resources/driveitem?view=odsp-graph-online
2. high level drive urls: https://docs.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0
3. list drive item children: https://docs.microsoft.com/en-us/graph/api/driveitem-list-children?view=graph-rest-1.0
4. graphe explorer: https://developer.microsoft.com/en-us/graph/graph-explorer
