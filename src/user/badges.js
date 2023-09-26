'use strict';

const async = require('async');
const nconf = require('nconf');
const validator = require('validator');

const db = require('../database');
const user = require('../user');

module.exports = function (User) {
    User.calculateBadge = async function (uid) {
        const reputation = await user.getUserField(uid, 'reputation');
        const postCount = await user.getUserField(uid, 'postcount');
        const userBadges = [];

        if (reputation > 5) {
            userBadges.push("⭐");
        } else if (reputation > 20) {
            userBadges.push("🌟");
        } else {
            userBadges.push("💫");
        }

        if (postCount > 5) {
            userBadges.push("🌱");
        } else if (postCount > 20) {
            userBadges.push("🌷");
        } else {
            userBadges.push("🌳");
        }

        return userBadges.join("")
    };
};