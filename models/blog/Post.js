var keystone = require('keystone')
var Types = keystone.Field.Types

/**
 * Post Model
 * ==========
 */

var Post = new keystone.List('Post', {
  map: { name: 'title' },
  autokey: { path: 'slug', from: 'title', unique: true },
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true }
})

Post.add({
  title: { type: String, required: true },
  state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
  author: { type: Types.Relationship, ref: 'Organizer', index: true },
  published: { type: Types.Date, index: true, dependsOn: { state: 'published' } },
  image: { type: Types.CloudinaryImage },
  content: {
    brief: { type: Types.Markdown, height: 150 },
    extended: { type: Types.Markdown, height: 400 }
  },
  categories: { type: Types.Relationship, ref: 'PostCategory', many: true }
})

Post.schema.virtual('content.full').get(function () {
  return this.content.extended || this.content.brief
})

Post.defaultColumns = 'title, state|20%, author|20%, published|20%'
Post.register()
