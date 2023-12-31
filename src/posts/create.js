'use strict';

const _ = require('lodash');

const meta = require('../meta');
const db = require('../database');
const plugins = require('../plugins');
const user = require('../user');
const topics = require('../topics');
const categories = require('../categories');
const groups = require('../groups');
const utils = require('../utils');

module.exports = function (Posts) {
    Posts.create = async function (data) {
        // This is an internal method, consider using Topics.reply instead
        const { uid } = data;
        const { tid } = data;
        const content = data.content.toString();
        const timestamp = data.timestamp || Date.now();
        const isMain = data.isMain || false;

        if (!uid && parseInt(uid, 10) !== 0) {
            throw new Error('[[error:invalid-uid]]');
        }

        if (data.toPid && !utils.isNumber(data.toPid)) {
            throw new Error('[[error:invalid-pid]]');
        }

        const pid = await db.incrObjectField('global', 'nextPid');
        let postData = {
            pid: pid,
            uid: uid,
            tid: tid,
            content: content,
            timestamp: timestamp,
        };

        if (data.toPid) {
            postData.toPid = data.toPid;
        }
        if (data.ip && meta.config.trackIpPerPost) {
            postData.ip = data.ip;
        }
        if (data.handle && !parseInt(uid, 10)) {
            postData.handle = data.handle;
        }

        let result = await plugins.hooks.fire('filter:post.create', { post: postData, data: data });
        postData = result.post;
        await db.setObject(`post:${postData.pid}`, postData);

        const topicData = await topics.getTopicFields(tid, ['cid', 'pinned']);
        postData.cid = topicData.cid;

        await Promise.all([
            db.sortedSetAdd('posts:pid', timestamp, postData.pid),
            db.incrObjectField('global', 'postCount'),
            user.onNewPostMade(postData),
            topics.onNewPostMade(postData),
            categories.onNewPostMade(topicData.cid, topicData.pinned, postData),
            groups.onNewPostMade(postData),
            addReplyTo(postData, timestamp),
            Posts.uploads.sync(postData.pid),
        ]);

        result = await plugins.hooks.fire('filter:post.get', { post: postData, uid: data.uid });
        result.post.isMain = isMain;
        plugins.hooks.fire('action:post.save', { post: _.clone(result.post) });
        return result.post;
    };

    // PARAMS: postData, which includes data on the post, and the timestamp of the post
    // RETURN: n/a, no return value
    async function addReplyTo(postData, timestamp) {
        if (typeof postData !== 'object' && typeof timestamp !== 'number') {
            throw new TypeError('The function must take in an object');
        }

        const isPinned = 0;
        if (!postData.toPid) {
            return;
        }
        // add reply to the set of replies for the post it is replying to in redis
        await Promise.all([
            db.sortedSetAdd(`pid:${postData.toPid}:replies`, timestamp, postData.pid + isPinned.toString()),
            db.incrObjectField(`post:${postData.toPid}`, 'replies'),
        ]);
        returnIdIfReplyIsPinned(postData);
    }

    // PARAMS: postData, which is the data on the post
    // RETURN: the pid (post id) of the reply that is pinned, if there is one
    async function returnIdIfReplyIsPinned(postData) {
        if (typeof postData !== 'object') {
            throw new TypeError('The function must take in an object');
        }

        let pin = '';
        // retrieve an array of all reply pids for the specific post
        const arrayOfReplyPids = await db.getSortedSetsMembers(postData.map(p => `pid:${p.pid}:replies`));
        for (const pid of arrayOfReplyPids) {
            if (pid.split(',')[1] === '1') {
                pin = pid;
            }
        }

        if (typeof pin !== 'string') {
            throw new TypeError('The function must return a string');
        }

        return pin;
    }
};
