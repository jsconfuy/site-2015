var keystone = require('keystone')

/**
 * PostCategory Model
 * ==================
 */

var PostCategory = new keystone.List('PostCategory', {
  autokey: { from: 'name', path: 'key', unique: true },
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true }
})

PostCategory.add({
  name: { type: String, required: true }
})

PostCategory.relationship({ ref: 'Post', path: 'categories' })

PostCategory.register()
