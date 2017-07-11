'use strict';

/**
 * Comments is your commenting instance.
 * Create one per page.
 *
 * @constructor
 * @param {String} appId - Stitch Application Id.
 * @param {String} mongoService - The mongoService to use.
 * @param {String} divId - The id of the div tag where to put the comments.
 * @param {String} slug - The slug to use for the comments. Defaults to url if doesn't exist.
 *
 */
class Comments {
    constructor(appId, mongoService, divId, slug) {
        this.client = new stitch.StitchClient(appId);
        this.db = this.client.service('mongodb', mongoService).db('blog');
        this.commentsCollection = this.db.collection("comments");

        this.commentsDiv = document.getElementById(divId);
        if (!this.commentsDiv) {
            console.log("cannot find div '" + divId + "' for comments");
            window.alert("cannot find div '" + divId + "' for comments");
        }

        if (!slug || slug.length == "") {
            slug = document.location.pathname;
            slug = slug.replace(/index.html$/, '');
        }
        this.slug = slug;

        this.templates = {
            root : Handlebars.templates["root.html"]
        }
    }

    displayComments() {
        if (this.client.authedId()) {
            this.displayComments_PostLogin();
        } else {
            this.client.login().then(this.displayComments_PostLogin);
        }
    }

    displayComments_PostLogin() {
        this.commentsCollection.find({ slug : this.slug }).then(docs => {
            var html = this.templates.root({comments: docs});
            this.commentsDiv.innerHTML = html;
        });
    }

    addComment() {
        var foo = document.getElementById("new_comment");
        var doc = { owner_id : this.client.authedId(),
                    slug : this.slug,
                    comment: foo.value};
        this.commentsCollection.insert(doc).then(() => this.displayComments_PostLogin());
        foo.value = "";
    }

}
