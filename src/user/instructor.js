'use strict';

const db = require('../database');
const batch = require('../batch');
const user = require('.');
const groups = require('../groups');
const meta = require('../meta');
// const privileges = require('../privileges');

const now = Date.now();
module.exports = {
    name: 'Create instructor user groups',
    timestamp: Date.UTC(2020, 9, 13),
    method: async function () {
        const { progress } = this;

        const maxGroupLength = meta.config.maximumGroupNameLength;
        meta.config.maximumGroupNameLength = 30;
        const timestamp = await db.getObjectField('group:administrators', 'timestamp');
        const instructorExists = await groups.exists('instructors');
        if (!instructorExists) {
            await groups.create({
                name: 'instructors',
                hidden: 1,
                private: 1,
                system: 1,
                disableLeave: 1,
                disableJoinRequests: 1,
                timestamp: timestamp + 1,
            });
        }
        // restore setting
        meta.config.maximumGroupNameLength = maxGroupLength;
        await batch.processSortedSet('users:instructors', async (uids) => {
            progress.incr(uids.length);
            const userData = await user.getUsersFields(uids, ['uid', 'accounttype:instructor']);

            const instructor = userData.filter(u => parseInt(u['accounttype:instructor'], 10) === 1);
            await db.sortedSetAdd(
                'group:instructors:members',
                instructor.map(() => now),
                instructor.map(u => u.uid)
            );
        }, {
            batch: 500,
            progress: this.progress,
        });

        await db.delete('users:notvalidated');
        //       await updatePrivilges();

        const instructorCount = await db.sortedSetCard('group:instructors:members');
        await db.setObjectField('group:instructors', 'memberCount', instructorCount);
    },
};
