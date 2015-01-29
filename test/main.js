var test = require('tape');
var Collection = require('ampersand-collection');
var Model = require('ampersand-state');

var PaginatedSubcollection = require('../');

// our widget model
var Widget = Model.extend({
    props: {
        id: 'number',
        name: 'string',
        awesomeness: 'number',
        sweet: 'boolean'
    }
});

// our base collection
var Widgets = Collection.extend({
    model: Widget,
    comparator: 'awesomeness'
});

// helper for getting a base collection
function getBaseCollection(items) {
    var widgets = new Widgets();

    // add a hundred items to our base collection
    items = items || 100;
    while (items--) {
        widgets.add({
            id: items,
            name: 'abcdefghij'.split('')[items % 10],
            awesomeness: (items % 10),
            sweet: (items % 2 === 0)
        });
    }
    return widgets;
}

test('initial state', function (t) {
    var base = getBaseCollection();
    var sub = new PaginatedSubcollection(base);

    t.equal(sub.page, 1, 'default initial page is 1');
    t.equal(sub.pages, Math.ceil(sub.filtered.length / 50), 'default pages is ceil(filtered.length / 50), filtered.length: ' + sub.filtered.length);
    t.equal(sub.last, sub.pages, 'last page is equal to pages');

    t.end();
});