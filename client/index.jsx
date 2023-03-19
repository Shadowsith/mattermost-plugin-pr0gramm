import React from 'react';
import axios from 'axios';
import './style.css';

import {
    Pr0grammInfo,
    Pr0grammGet,
    ClientSettings,
} from './types.jsx';

export class PostWillRenderEmbed extends React.Component {
    static plugin;
    /**
     * @type {ClientSettings}
     */
    static settings;
    /**
     * @type {string}
     */
    static apiUrl;

    constructor(props) {
        super(props);
        this.uid = this.uuidv4();
    }

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
                pr0grammId = uri[1];
            }
        }
        const uid = this.uid;
        try {
            if (pr0grammId > 0) {
                this.handleId(uid, pr0grammId);
            } else {
                this.handleFileUrl(uid, fileUrl);
            }
        } catch {
        }
        const css = `
            .container-mh {
                min-height: ${PostWillRenderEmbed.settings.maxHeight}px;
            }

            .file-mh {
                min-height: ${PostWillRenderEmbed.settings.maxHeight}px;
                height: ${PostWillRenderEmbed.settings.maxHeight}px;
            }
        `

        return <>
            <style>{css}</style>
            <div id={uid} class="container-mh">
                <div id={uid + '_tags'} clas="mt-1 mb-1"></div>
                <div id={uid + '_rating'} class="mt-2 mb-1"></div>
                <div id={uid + '_file'} class="file-mh"></div>
            </div>
            <div id={uid + '_modal'} class="pr0gramm-modal">
                <div class="pr0gramm-modal-content">
                    <img id={uid + '_modal_img'} src=""></img>
                </div>
            </div>
        </>
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
                // console.log('Error', err);
            });
        axios.get(`${PostWillRenderEmbed.apiUrl}/get?id=${id}`)
            .then(res => {
                this.handleRating(uid, res.data);
                this.handleImgResult(uid, res.data);
            }).catch(err => {
                // console.log('Error', err);
            });
    }

    handleFileUrl(uid, fileUrl) {
        axios.get(`${PostWillRenderEmbed.apiUrl}/reverse?fileUrl=${encodeURIComponent(fileUrl)}`)
            .then(res => {
                if (res.data.error != null) {
                    this.handleFallbackImgResult(uid);
                } else {
                    this.handleRating(uid, res.data, true);
                    this.handleImgResult(uid, res.data)
                    const f = new Pr0grammGet(res.data).items[0];
                    axios.get(`${PostWillRenderEmbed.apiUrl}/info?id=${f.id}`)
                        .then(r => {
                            this.handleTagResult(uid, r.data);
                        }).catch(err => {
                            // console.log('Error', err);
                        });

                }
            }).catch(err => {
                this.handleFallbackImgResult(uid);
            });
    }


    handleTagResult(uid, data) {
        const info = new Pr0grammInfo(data);
        if (PostWillRenderEmbed.settings.tags == false) {
            return;
        }
        /**
         * @type {HTMLDivElement}
         */
        const tagElement = document.getElementById(uid + '_tags');
        const relevant = info.tags.filter(x => x.confidence > 0.2)
            .sort((a, b) => {
                if (a.confidence < b.confidence) {
                    return 1;
                } else if (a.confidence > b.confidence) {
                    return -1;
                } else {
                    return 0;
                }
            });
        tagElement.innerHTML = relevant.map(x =>
            `<span class="mt-1 mb-1 mr-1 badge badge-pr0tag no-flex">${x.tag}</span>`)
            .join(' ')
    }

    handleRating(uid, data, isFileUrl = false) {
        const get = new Pr0grammGet(data);
        if (PostWillRenderEmbed.settings.rating == false) {
            return;
        }
        const file = get.items[0];
        /**
         * @type {HTMLDivElement}
         */
        const ratingElement = document.getElementById(uid + '_rating');
        ratingElement.innerHTML =
            `<span class="pt-1 pb-1 mr-1 badge badge-info no-flex">
                Rating: ${file.up - file.down} 
            </span>
            <span class="pt-1 pb-1 mr-1 badge badge-success no-flex">
                +${file.up} 
            </span>
            <span class="pt-1 pb-1 mr-1 badge badge-danger no-flex">
                -${file.down}
            </small>`
        if (isFileUrl == true) {
            ratingElement.innerHTML += `
            <a href="https://pr0gramm.com/new/${get.items[0].id}" target="_blank">
                <span class="icon-link-variant">
                Original post
            </span>`;
        }
    }

    handleImgResult(uid, data) {
        const file = new Pr0grammGet(data);
        /**
         * @type {HTMLDivElement}
         */
        const fileElement = document.getElementById(uid + '_file');
        const f = file.items[0].image;
        const maxHeight = PostWillRenderEmbed.settings.maxHeight;
        if (f.includes('.mp4')) {
            const fileUrl = `https://vid.pr0gramm.com/` + f;
            fileElement.innerHTML = this.getVideoElement(fileUrl, maxHeight, 'video/mp4');
        } else if (f.includes('.webm')) {
            const fileUrl = `https://vid.pr0gramm.com/` + f;
            fileElement.innerHTML = this.getVideoElement(fileUrl, maxHeight, 'video/webm');
        } else {
            const fileUrl = `https://img.pr0gramm.com/` + f;
            fileElement.append(this.getImgElement(fileUrl, maxHeight));
        }
    }

    handleFallbackImgResult(uid) {
        const fileElement = document.getElementById(uid + '_file');
        const url = this.props.embed.url;
        const maxHeight = PostWillRenderEmbed.settings.maxHeight;
        if (url.includes('.mp4')) {
            fileElement.innerHTML = this.getVideoElement(url, maxHeight, 'video/mp4');
        } else if (url.includes('.webm')) {
            fileElement.innerHTML = this.getVideoElement(url, maxHeight, 'video/webm');
        } else {
            fileElement.append(this.getImgElement(url, maxHeight));
        }
    }

    getVideoElement(url, maxHeight, type) {
        return `<video class="mt-1" controls style="max-height: ${maxHeight}px"}>
            <source src=${url} type=${type}></source>
        </video>`;
    }

    getImgElement(url, maxHeight) {
        const img = document.createElement('img');
        img.src = url;
        img.className = 'mt-1';
        img.style.maxHeight = `${maxHeight}px`;

        const showModal = () => {
            const modal = document.getElementById(`${this.uid}_modal`);
            const modalImg = document.getElementById(`${this.uid}_modal_img`);
            modalImg.src = img.src;
            modal.style.zIndex = 1000;
            const uidElem = document.getElementById(this.uid);
            document.body.appendChild(modal);
            modal.style.display = 'block';
            modal.addEventListener('click', () => {
                modal.style.display = 'none';
                modal.style.zIndex = 1;
                uidElem.parentElement.appendChild(modal);
            });
        }
        img.addEventListener('click', showModal);

        return img;
    }

    uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

}

class Pr0grammPlugin {
    static apiUrl = '/plugins/pr0gramm';

    initialize(registry, store) {
        const plugin = store.getState().plugins.plugins.pr0gramm;
        PostWillRenderEmbed.plugin = plugin;
        PostWillRenderEmbed.apiUrl = Pr0grammPlugin.apiUrl;

        axios.get(`${PostWillRenderEmbed.apiUrl}/settings`)
            .then(res => {
                PostWillRenderEmbed.settings = new ClientSettings(res.data);
                this.registerPlugin(registry);
            })
            .catch(err => {
                PostWillRenderEmbed.settings = new ClientSettings();
                this.registerPlugin(registry);
            });
    }

    registerPlugin(registry) {
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

if (window.registerPlugin != null) {
    window.registerPlugin('pr0gramm', new Pr0grammPlugin());
}