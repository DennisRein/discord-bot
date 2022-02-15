
module.exports = class Twitch {


    constructor() {

  //      import { ClientCredentialsAuthProvider } from '@twurple/auth';
  //      import { ApiClient } from '@twurple/api';
        let ClientCredentialsAuthProvider = require('@twurple/auth');
        let ApiClient = require('@twurple/api');

        const authProvider = new ClientCredentialsAuthProvider.ClientCredentialsAuthProvider(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET);
        this.apiClient = new ApiClient.ApiClient({ authProvider });
    }

    async isStreamLive(userName) {
        const user = await this.apiClient.users.getUserByName(userName);
        if (!user) {
            return null;
        }
        let mem = await this.apiClient.streams.getStreamByUserId(user.id);
        if(!mem) return null;

        let profilePic = (await mem.getUser()).profilePictureUrl;
        let thumbnailUrl = mem.getThumbnailUrl(300, 300);
        let title = mem.title;
        let viewers = mem.viewers;
        let startDate = mem.startDate;
        let gameName = mem.gameName;
        let displayName = mem.userDisplayName;

        let member = {
            profilePic: profilePic,
            thumbnail: thumbnailUrl,
            title: title,
            viewers: viewers,
            startDate: startDate,
            gameName: gameName,
            displayName: displayName
        }

        return member;
    }

}