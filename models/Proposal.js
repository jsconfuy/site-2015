var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Proposals Model
 * ===============
 */

var Proposal = new keystone.List('Proposal', {
  map: { name: 'topic' },
  track: { createdBy: true, createdAt: true, updatedBy: true, updatedAt: true },
  sortable: true,
});

Proposal.add(
  {
    topic: { type: String, required: true, intial: true },
    status: { type: Types.Select, default: 'N', options: [
      { value: 'N', label: 'New' },
      { value: 'P', label: 'Pending' },
      { value: 'A', label: 'Accepted' },
      { value: 'D', label: 'Declined' }]},
    source: { type: Types.Select, required: true, default: 'C', options: [
      { value: 'C', label: 'Call' },
      { value: 'I', label: 'Internal' },]},
    type: { type: Types.Select, required: true, default: 'T', options: [
      { value: 'K', label: 'Key Note' },
      { value: 'T', label: 'Talk' },
      { value: 'W', label: 'Workshop' },]},
    summary: { type: Types.Textarea},
    coasted: { type: Types.Boolean, intial: true, default: false, indent: true },
    name: { type: String },
    email: { type: Types.Email },
    residence: { type: String },
    biography: { type: Types.Textarea },
    notes: { type: Types.Markdown },
    tags: { type: Types.Relationship, ref: 'Tag', many: true },
    assignee: { type: Types.Relationship, ref: 'Organizer', index: true },
  },
  'Votes',
  {
    score: { type: Types.Number, noedit: true, default: 0 },
    votes: {
      // TODO: Custom field type Vote / Organizer
      pricco: { label: 'Pablo Ricco', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      gchertok: { label: 'Gabriel Chertok', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      pdejuan : { label: 'Pablo Dejuan', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      respinosa : { label: 'Rodrigo Espinosa', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      lcal : { label: 'Luis Cal', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      ssassi: { label: 'Sebastian Sassi', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      mprunell: { label: 'Martin Prunell', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
      gcura: { label: 'Guillermo Cura', type: Types.Select, default: 0, numeric: true, options: [0, 1, 2, 3, 4, 5] },
    },
    comments: { type: Types.Markdown },
  }
);

Proposal.schema.pre('save', function(next) {
    var votes = 0;
    var score = 0;
    var inc = function(vote) {
      score += vote || 0;
      votes += vote ? 1 : 0;
    }
    inc(this.votes.pricco);
    inc(this.votes.gchertok);
    inc(this.votes.pdejuan);
    inc(this.votes.respinosa);
    inc(this.votes.lcal);
    inc(this.votes.ssassi);
    inc(this.votes.mprunell);
    inc(this.votes.gcura);
    this.score = (votes ? score / votes : 0).toFixed(1);
    next();
});

Proposal.relationship({ ref: 'Tag', path: 'tags' });
Proposal.defaultColumns = 'topic|30%, name, coasted, tags, status, score';
Proposal.register();
