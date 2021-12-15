- pagination [x]
- follow service.spec [x]
- suggestions service.spec [x]

**_ Follow Entity. User <-> User Relations _**

- getUserFollows [x]
- getFollowingUsersInfo [x]
- getFollowersInfo [x]
- create follow [x]
- unfollow [x]

**_ Suggestion Entity (with message, place) Follower <-> Follower Relations _**

- Users can see everything but Suggestions(private)
- suggestion entity [x]
- get, send, delete suggestion [x]

  **_ subscription _**

- Pending Follows [x]
- Pending Suggestions [x]

**_ 🤔 _**

- modify pagination by case 1.map 2.paginated
- edit password (separation from editProfile)
- password minlength
- logout mutation is necessary?
- auto deletion (avatarUrl, place with no relations or suggestions)
