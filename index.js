var State = require('ampersand-state');
var SubCollection = require('ampersand-subcollection');

var Pagination = State.extend({
    props: {
        pageSize: ['number', true, 50],
        page: ['number', true, 1],
        parent: 'collection',
        size: ['number', true, 0]
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
        if (this.parent) {
            this.size = this._collectionLength() || 0;
            this.listenTo(this.parent, 'add remove sync reset', this._updateSize);
        }
    },
    _collectionLength: function () {
        if (this.parent && this.parent.filtered) return this.parent.filtered.length;
        return this.parent.length;
    },
    _updateSize: function () {
        this.size = this._collectionLength();
    }
});

function _Paginator(collection, config) {
    config = config || {};
    SubCollection.call(this, collection, {});
    config.parent = this;
    this.initPagination(config);
    var bounds = this.pagination.bounds;
    config.offset = bounds.offset;
    config.limit = bounds.limit;
    this.configure(config);
}


var Paginator = module.exports = SubCollection.extend({
    constructor: _Paginator,
    _pagination: Pagination,
    initPagination: function (config) {
        this.pagination = new this._pagination(config);
        this.listenTo(this.pagination, 'change:bounds', this._changePage);
        return this;
    },
    _changePage: function (pagination, bounds) {
        var page = pagination.page;
        var event;
        this.configure(bounds);
        if (page === 1) {
            event = 'page:first';
        } else if (page === pagination.pages) {
            event = 'page:last';
        } else {
            event = 'page:change';
        }
        this.trigger(event, this, page);
    },
    getFirstPage: function () {
        return (this.page = 1);
    },
    getLastPage: function () {
        if (this.page === this.pages) return this.page;
        return (this.page = this.pages);
    },
    getNextPage: function () {
        if (!this.hasNextPage()) return this.getLastPage();
        return ++this.page;
    },
    getPreviousPage: function () {
        if (this.page < 2) return this.getFirstPage();
        return --this.page;
    },
    hasNextPage: function () {
        return this.page < this.pages;
    },
    hasPreviousPage: function () {
        return (this.page - 1) > 0;
    }
});

Object.defineProperties(Paginator.prototype, {
    page: {
        get: function () {
            return this.pagination.page;
        },
        set: function (newPage) {
            if (typeof newPage === 'number') {
                if (newPage < 1) {
                    throw new RangeError('Cannot set page < 1.');
                }
                if (newPage > this.pagination.pages) {
                    throw new RangeError('Cannot set page > ' + this.pagination.pages + '.');
                }
            }
            this.pagination.page = newPage;
        }
    },
    pages: {
        get: function () {
            return this.pagination.pages;
        }
    },
    first: { get: Paginator.prototype.getFirstPage },
    last: { get: Paginator.prototype.getLastPage },
    next: { get: Paginator.prototype.getNextPage },
    previous: { get: Paginator.prototype.getPreviousPage }
});