const Sequelize = require('sequelize');
module.exports = class DB {

    init() {
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
    }

    get userModel() {
        return this.users; 
    }

    get autoMessageModel() {
        return this.automaticMessage;
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
            interval: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            lastsend: Sequelize.DATE,
        });
    }

    sync() {
        this.automaticMessage.sync();
        this.users.sync();
    }
}