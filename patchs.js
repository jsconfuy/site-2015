var keystone = require('keystone');

// Wait for https://github.com/keystonejs/keystone/issues/670
keystone.List.prototype.defaultSelectColumns = keystone.List.prototype.selectColumns;
keystone.List.prototype.selectColumns = function(query, columns) {
  var list = this;
  var allColumns = columns;
  columns.forEach(function(col){
    var virtual = list.model.schema.virtuals[col.path];
    if(virtual && virtual.depends) {
      // TODO: Check if the column is already added
      allColumns = allColumns.concat(list.expandColumns(virtual.depends));
    }
  });
  return this.defaultSelectColumns(query, allColumns);
};
