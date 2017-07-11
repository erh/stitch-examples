(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['foo.html'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div id=\"foo\"></div>\n";
},"useData":true});
templates['root.html'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "    <div>"
    + container.escapeExpression(((helper = (helper = helpers.comment || (depth0 != null ? depth0.comment : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"comment","hash":{},"data":data}) : helper)))
    + "</div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div id=\"comments_section\">\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.comments : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>\n<hr>\n<div>\n    Add a Comment: <input id=\"new_comment\"><input type=\"submit\" onClick=\"comments.addComment()\">\n</div>\n";
},"useData":true});
})();'use strict';

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
