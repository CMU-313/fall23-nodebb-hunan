/* 'use strict';
The whole file has been commented out due to an incomplete feature
const db = require('../database');

const batch = require('../batch');
const user = require('.');
const groups = require('../groups');
const meta = require('../meta');
// const privileges = require('../privileges');

const now = Date.now();
module.exports = {
    name: 'Create student/instructor user groups',
    timestamp: Date.UTC(2020, 9, 13),
    method: async function () {
        const { progress } = this;

        const maxGroupLength = meta.config.maximumGroupNameLength;
        meta.config.maximumGroupNameLength = 30;
        const timestamp = await db.getObjectField('group:administrators', 'timestamp');
        const studentExists = await groups.exists('students');
        if (!studentExists) {
            await groups.create({
                name: 'students',
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
        await batch.processSortedSet('users:students', async (uids) => {
            progress.incr(uids.length);
            const userData = await user.getUsersFields(uids, ['uid', 'accounttype:student']);

            const student = userData.filter(u => parseInt(u['accounttype:student'], 10) === 1);
            await db.sortedSetAdd(
                'group:students:members',
                student.map(() => now),
                student.map(u => u.uid)
            );
        }, {
            batch: 500,
            progress: this.progress,
        });

        await db.delete('users:notvalidated');
        //        await updatePrivilges();

        const studentCount = await db.sortedSetCard('group:students:members');
        await db.setObjectField('group:students', 'memberCount', studentCount);
    },
};
*/
