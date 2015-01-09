var State = require('ampersand-state');
var SubCollection = require('ampersand-subcollection');

var Pagination = State.extend({
    session: {
        pageSize: {
            type: 'number',
            required: true,
            default: 50
        },
        page: {
            type: 'number',
            required: true,
            default: 1
        },
        parent: 'state',
        size: {
            type: 'number',
            required: true,
            default: 0
        }
    },
    derived: {
        bounds: {
            deps: ['page', 'pageSize'],
            fn: function () {
                return {
                    offset: (this.page - 1) * this.pageSize,
                    limit: this.pageSize
                };
            }
        },
        pages: {
            deps: ['size'],
            fn: function () {
                return Math.ceil(this.size / this.pageSize);
            }
        }
    },
    initialize: function (opts) {
        if (this.parent && this.parent.filtered) {
            this.size = this.parent.filtered.length || 0;
            this.listenTo(this.parent, 'add remove sync reset', function () {
                this.size = this.parent.filtered.length;
            });
        }
    }
});

function Paginator(collection, config) {
    SubCollection.call(this, collection);
    config.parent = this;
    this.initPagination(config);
    this.configure(this.pagination.bounds);
}


module.exports = SubCollection.extend({
    constructor: Paginator,
    _pagination: Pagination,
    initPagination: function (config) {
        this.pagination = new this._pagination(config);
        return this;
    },
    getFirstPage: function () {
        this.pagination.page = 1;
        this.configure(this.pagination.bounds);
        this.trigger('page:first', this, 1);
    },
    getLastPage: function () {
        if (this.pagination.page === this.pagination.pages) return;
        var page = this.pagination.page = this.pagination.pages;
        this.configure(this.pagination.bounds);
        this.trigger('page:last', this, page);
    },
    getNextPage: function () {
        if (!this.hasNextPage()) return this.getLastPage();
        this.pagination.page++;
        this.configure(this.pagination.bounds);
    },
    getPreviousPage: function () {
        if (this.pagination.page > 2) {
            this.pagination.page--;
            this.configure(this.pagination.bounds);
        } else {
            this.getFirstPage();
        }
    },
    hasNextPage: function () {
        return this.pagination.page < this.pagination.pages;
    },
    hasPreviousPage: function () {
        return (this.pagination.page - 1) > 0;
    }
});