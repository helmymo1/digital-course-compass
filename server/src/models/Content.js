const mongoose = require('mongoose');

const contentVersionSchema = new mongoose.Schema({
  body: { type: String, required: true },
  version: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: { // For URL-friendly identifiers
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'scheduled', 'published', 'archived'],
    default: 'draft',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approver: { // User who approved the content
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  version: { // Current active version number
    type: Number,
    default: 1,
  },
  versionHistory: [contentVersionSchema],
  scheduledAt: { // For content scheduling
    type: Date,
  },
  publishedAt: { // When the content actually went live
    type: Date,
  },
  tags: [String],
  contentType: { // E.g., 'article', 'blog_post', 'page', 'product_update'
    type: String,
    default: 'article',
  },
  metaData: { // For SEO and other metadata
    description: String,
    keywords: [String],
  },
  // Add any other fields relevant to your CMS, like categories, featured images, etc.
}, { timestamps: true }); // `createdAt` and `updatedAt` will be automatically managed

// Pre-save hook to generate slug from title if not provided or to ensure it's URL-friendly
contentSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }
  // Initialize version history with the first version
  if (this.isNew && this.body) {
    this.versionHistory.push({
      body: this.body,
      version: 1,
      updatedBy: this.author, // Or whoever is making this initial save
    });
  }
  next();
});

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;
