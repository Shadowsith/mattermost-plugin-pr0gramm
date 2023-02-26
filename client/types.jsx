export class ClientSettings {
    constructor(s) {
        /**
         * @type {number}
         */
        this.maxHeight = s.maxHeight;
        /**
         * @type {boolean}
         */
        this.tags = s.tags;
        /**
         * @type {boolean}
         */
        this.rating = s.rating;
    }
}

export class Pr0grammComment {
    constructor(c) {
        /**
         * @type {number}
         */
        this.confidence = c.confidence;
        /**
         * @type {string}
         */
        this.content = c.content;
        /**
         * @type {number}
         */
        this.created = c.created;
        /**
         * @type {number}
         */
        this.down = c.down;
        /**
         * @type {number}
         */
        this.id = c.id;
        /**
         * @type {number}
         */
        this.mark = c.mark;
        /**
         * @type {string}
         */
        this.name = c.name;
        /**
         * @type {number}
         */
        this.parent = c.parent;
        /**
         * @type {number}
         */
        this.up = c.up;
    }

    /**
     * @param comments
     * @returns {Pr0grammComment[]}
     */
    static parseList(comments) {
        const list = [];
        for (const c of comments) {
            list.push(new Pr0grammComment(c));
        }
        return list;
    }
}

export class Pr0grammTag {
    constructor(t) {
        /**
         * @type {number}
         */
        this.id = t.id;
        /**
         * @type {number}
         */
        this.confidence = t.confidence;
        /**
         * @type {string}
         */
        this.tag = t.tag;
    }

    /**
     * @param tags 
     * @returns {Pr0grammTag[]}
     */
    static parseList(tags) {
        const list = [];
        for (const t of tags) {
            list.push(new Pr0grammTag(t));
        }
        return list;
    }

}

export class Pr0grammInfo {
    constructor(data) {
        /**
         * @type {string}
         */
        this.cache = data.cache;
        /**
         * @type {Pr0grammComment[]}
         */
        this.comments = Pr0grammComment.parseList(data.comments);
        /**
          * @type {Pr0grammTag[]}
          */
        this.tags = Pr0grammTag.parseList(data.tags);
        /**
         * @type {number}
         */
        this.qc = data.qc;
        /**
         * @type {number}
         */
        this.rt = data.rt;
        /**
         * @type {number}
         */
        this.ts = data.ts;
        /**
         * @type {ClientSettings}
         */
        this.clientSettings = new ClientSettings(data.clientSettings);
    }
}

export class Pr0grammItem {
    constructor(itm) {
        /**
         * @type {number}
         */
        this.id = itm.id;
        /**
         * @type {number}
         */
        this.promoted = itm.promoted;
        /**
         * @type {number}
         */
        this.userId = itm.userId;
        /**
         * @type {number}
         */
        this.up = itm.up;
        /**
         * @type {number}
         */
        this.down = itm.down;
        /**
         * @type {number}
         */
        this.created = itm.created;
        /**
         * @type {string}
         */
        this.image = itm.image;
        /**
         * @type {string}
         */
        this.thumb = itm.thumb;
        /**
         * @type {string}
         */
        this.fullsize = itm.fullsize;
        /**
         * @type {string|null}
         */
        this.preview = itm.preview;
        /**
         * @type {number}
         */
        this.width = itm.width;
        /**
         * @type {number}
         */
        this.height = itm.height;
        /**
         * @type {boolean}
         */
        this.audio = itm.audio;
        /**
         * @type {string}
         */
        this.source = itm.source;
        /**
         * @type {number}
         */
        this.flags = itm.flags;
        /**
         * @type {string}
         */
        this.user = itm.user;
        /**
         * @type {number}
         */
        this.mark = itm.mark;
        /**
         * @type {number}
         */
        this.gift = itm.gift;
    }

    /**
     * @param items 
     * @returns {Pr0grammItem[]}
     */
    static parseList(items) {
        const list = [];
        for (const itm of items) {
            list.push(new Pr0grammItem(itm));
        }
        return list;
    }
}

export class Pr0grammGet {
    constructor(data) {
        /**
         * @type {boolean}
         */
        this.atEnd = data.atEnd;
        /**
         * @type {boolean}
         */
        this.atStart = data.atStart;
        /**
         * @type {any | null}
         */
        this.error = data.error;
        /**
         * @type {Pr0grammItem[]}
         */
        this.items = Pr0grammItem.parseList(data.items);
        this.ts = data.ts;
        /**
         * @type {string}
         */
        this.cache = data.cache;
        /**
         * @type {number}
         */
        this.rt = data.rt;
        /**
         * @type {number}
         */
        this.qc = data.qc;
        /**
         * @type {ClientSettings}
         */
        this.clientSettings = new ClientSettings(data.clientSettings);
    }
}