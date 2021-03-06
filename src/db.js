const Sequelize = require('sequelize');
module.exports = class DB {

    init() {
        console.log("Init DB");
        this.sequelize();
        this.initiateModels();
    }

    sequelize() {
        const sequelize = new Sequelize('database', 'user', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: false,
            // SQLite only
            storage: 'database.sqlite',
        });
        this.sequelize = sequelize;
    }

    initiateModels() {
        this.createUserModel();
        this.createAutomaticMessageModel();
        this.createWunschbrunnenModel();
        this.createMessageModel();
        this.createTimedRolesModel();
    }

    get userModel() {
        return this.users; 
    }

    get autoMessageModel() {
        return this.automaticMessage;
    }

    get wunschbrunnenModel() {
        return this.wunschbrunnen;
    }

    get messagesModel() {
        return this.messages;
    }

    get timedRolesModel() {
        return this.timedRoles;
    }

    createWunschbrunnenModel() {
        this.wunschbrunnen = this.sequelize.define('wunschbrunnen', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userid: {
                type: Sequelize.STRING
            },
            message: Sequelize.STRING,
            sent: Sequelize.DATE,
            replied: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            }
        });
    }

    createUserModel() {
        this.users = this.sequelize.define('users', {
            userid: {
                type: Sequelize.STRING,
                unique: true,
            },
            username: Sequelize.STRING,
            joined: Sequelize.DATE,
            lastmessage: Sequelize.DATE,
            hasrole: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            activity: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false,
            }
        });
    }

    createAutomaticMessageModel() {
        this.automaticMessage = this.sequelize.define('automaticmessages', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            channel: {
                type: Sequelize.STRING
            },
            message: Sequelize.TEXT,
            title: Sequelize.TEXT,
            interval: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            lastsend: Sequelize.DATE,
        });
    }

    createMessageModel() {
        this.messages = this.sequelize.define('messages', {
            id: {
                type: Sequelize.STRING,
                primaryKey: true
            },
            channel: {
                type: Sequelize.STRING
            },
            message: Sequelize.TEXT,
            sender: Sequelize.TEXT,
            timestamp: Sequelize.DATE,
        });
    }

    createTimedRolesModel() {
        this.timedRoles = this.sequelize.define('timedroles', {
            userid: {
                type: Sequelize.STRING,
                unique: true,
            },
            reactionid: {
                type: Sequelize.STRING,
            },
            channelid: Sequelize.STRING,
            loseroleafter: Sequelize.DATE,
            messageid: Sequelize.STRING,
            roleid: Sequelize.STRING
            
        });
    }

    sync() {
        this.automaticMessage.sync();
        this.users.sync();
        this.wunschbrunnen.sync();
        this.messages.sync();
        this.timedRoles.sync();
    }
}