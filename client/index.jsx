import React from 'react';
import axios from 'axios';
import {
    Pr0grammInfo,
    Pr0grammGet,
} from './types.jsx';

class PostWillRenderEmbed extends React.Component {
    static plugin;
    static apiUrl = '/plugins/pr0gramm';

    render() {
        /**
         * @type {string}
         */
        const url = this.props.embed.url;
        /**
         * @type {number}
         */
        let pr0grammId = 0, fileUrl = '';
        if (url.includes('vid.') || url.includes('img.')) {
            fileUrl = url.replace('https://img.pr0gramm.com/', '')
                .replace('https://vid.pr0gramm.com/', '');
        } else {
            const uri = url.replace('https://pr0gramm.com/top/', '')
                .replace('https://pr0gramm.com/new/', '').split('/');
            if (uri.length == 1) {
                pr0grammId = uri[0];
            } else if (uri.length > 1) {
                pr0grammId  = uri[1];
            }
        }
        const uid = this.uuidv4();
        try {
            if (pr0grammId > 0) {
                this.handleId(uid, pr0grammId);
            } else {
                this.handleFileUrl(uid, fileUrl);
            }
        } catch {
        }
        return <div id={uid}>
            <div id={uid + '_tags'}></div>
            <div id={uid + '_rating'}></div>
            <div id={uid + '_file'}></div>
        </div>
    }

    // TODO
    getSettings() {

    }

    /**
     * @param {string} uid 
     * @param {number} id 
     */
    handleId(uid, id) {
        axios.get(`${PostWillRenderEmbed.apiUrl}/info?id=${id}`)
            .then(res => {
                this.handleTagResult(uid, res.data);
            }).catch(err => {
                console.log('Error', err);
            });
        axios.get(`${PostWillRenderEmbed.apiUrl}/get?id=${id}`)
            .then(res => {
                this.handleRating(uid, res.data);
                this.handleImgResult(uid, res.data);
            }).catch(err => {
                console.log('Error', err);
            });
    }

    handleFileUrl(uid, fileUrl) {
        axios.get(`${PostWillRenderEmbed.apiUrl}/reverse?fileUrl=${encodeURIComponent(fileUrl)}`)
            .then(res => {
                this.handleRating(uid, res.data);
                this.handleImgResult(uid, res.data)
                const f = new Pr0grammGet(res.data).items[0];
                axios.get(`${PostWillRenderEmbed.apiUrl}/info?id=${f.id}`)
                    .then(r => {
                        this.handleTagResult(uid, r.data);
                    }).catch(err => {
                        console.log('Error', err);
                    });
            }).catch(err => {
                console.log('Error', err);
            });
    }


    handleTagResult(uid, data) {
        const info = new Pr0grammInfo(data);
        if (info.clientSettings.tags == false) {
            return;
        }
        /**
         * @type {HTMLDivElement}
         */
        const tagElement = document.getElementById(uid + '_tags');
        tagElement.innerHTML = `<small class="pt-2 pb-2" style="font-weight: bold;">
            Tags: ${info.tags.map(x => x.tag).join(' | ')}
        </small>`;
    }

    handleRating(uid, data) {
        const get = new Pr0grammGet(data);
        if (get.clientSettings.rating == false) {
            return;
        }
        const file = get.items[0];
        /**
         * @type {HTMLDivElement}
         */
        const ratingElement = document.getElementById(uid + '_rating');
        ratingElement.innerHTML = `<small class="pt-2 pb-2" style="font-weight: bold;">
            Rating: ${file.up - file.down} (+${file.up} -${file.down})
        </small>`;
    }

    handleImgResult(uid, data) {
        const file = new Pr0grammGet(data);
        /**
         * @type {HTMLDivElement}
         */
        const fileElement = document.getElementById(uid + '_file');
        const f = file.items[0].image;
        const maxHeight = file.clientSettings.maxHeight;
        if (f.includes('.mp4')) {
            const fileUrl = `https://vid.pr0gramm.com/` + f;
            fileElement.innerHTML = `
                        <video class="mt-1" controls style="max-height: ${maxHeight}px">
                            <source src="${fileUrl}" type="video/mp4">
                        </video>
                        `;
        } else if (f.includes('.webm')) {
            const fileUrl = `https://vid.pr0gramm.com/` + f;
            fileElement.innerHTML = `
                        <video class="mt-1" controls style="max-height: ${maxHeight}px">
                            <source src="${fileUrl}" type="video/webm">
                        </video>
                        `;
        } else {
            const fileUrl = `https://img.pr0gramm.com/` + f;
            fileElement.innerHTML =
                `<img class="mt-1" src="${fileUrl}" style="max-height: ${maxHeight}px">`;
        }
    }

    uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

}

class Pr0grammPlugin {
    initialize(registry, store) {
        const plugin = store.getState().plugins.plugins.pr0gramm;
        PostWillRenderEmbed.plugin = plugin;
        registry.registerPostWillRenderEmbedComponent(
            (embed) => {
                if (embed.type == 'link' && embed.url.includes('pr0gramm.com')) {
                    return true;
                } else if (embed.type == 'image' && embed.url.includes('pr0gramm.com')) {
                    return true;
                }
                return false;
            },
            PostWillRenderEmbed,
            false,
        );
    }

    uninitialize() {
        // No clean up required.
    }
}

window.registerPlugin('pr0gramm', new Pr0grammPlugin());