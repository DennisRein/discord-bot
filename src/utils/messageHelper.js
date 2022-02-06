module.exports = class MessageHelper {

    constructor(client) {
        this.client = client;
    }

    async fetchAllForUserInChannel(user, channel) {
        return await this.client.db.messagesModel.findAll({where: {sender: user, channel: channel.id}})
    }
    async fetchMessageById(messageId, channel) {
        let msg = await channel.messages.fetch(messageId);
        if(!msg) {
            msg = await this.client.db.messagesModel.findOne({where: {id: messageId}})
            let channel = await client.guilds.channels.fetch(msg.channel);
            return await channel.messages.fetch(messageId);
        }
        return msg;
    }

    async fetchChannelMessage(channel) {
        return await this.client.db.messagesModel.findAll({where: {channel: channel.id}})
    }

    async fetchMessagesByUser(userId) {
        return await this.client.db.messagesModel.findAll({where: {sender: userId}})
    }

}