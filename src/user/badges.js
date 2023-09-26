'use strict';

const user = require('../user');

// type signature:
// interface User {
//    calculateBadge(uid: number): Promise<string>;
// }
module.exports = function (User) {
    User.calculateBadge = async function (uid) {
        
        if (typeof uid !== 'number') {
            throw new TypeError('uid must be a number');
        }

        const reputation = await user.getUserField(uid, 'reputation');
        const postCount = await user.getUserField(uid, 'postcount');
        const userBadges = [];

        // users can have multiple badges based on
        // reputation and post count statistics
        if (reputation > 5) {
            userBadges.push('⭐');
        } else if (reputation > 20) {
            userBadges.push('🌟');
        } else {
            userBadges.push('💫');
        }

        if (postCount > 5) {
            userBadges.push('🌱');
        } else if (postCount > 20) {
            userBadges.push('🌷');
        } else {
            userBadges.push('🌳');
        }

        res = userBadges.join('');

        if (typeof res !== 'string') {
            throw new TypeError('The function must return a string');
        }

        return res;
    };
};
