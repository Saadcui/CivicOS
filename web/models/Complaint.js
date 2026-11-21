import mongoose from 'mongoose';

const RemarkSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  authorRole: {
    type: String,
    enum: ['officer', 'admin', 'citizen'],
    default: 'officer',
  },
  text: {
    type: String,
    required: [true, 'Remark text cannot be empty'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ComplaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [4, 'Title must be at least 4 characters'],
      maxlength: [180, 'Title cannot exceed 180 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Road Damage',
        'Street Lighting',
        'Drainage',
        'Garbage',
        'Water Supply',
        'Electricity',
        'Public Safety',
        'Parks & Recreation',
        'Other',
      ],
      default: 'Other',
      index: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    source: {
      type: String,
      enum: ['citizen', 'ai_cctv'],
      default: 'citizen',
      index: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
      index: true,
    },
    submittedByName: {
      type: String,
      default: 'Citizen',
    },
    submittedByEmail: {
      type: String,
      default: '',
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
      city: {
        type: String,
        default: 'Metropolis',
      },
      lat: {
        type: Number,
        default: null,
      },
      lng: {
        type: Number,
        default: null,
      },
    },
    department: {
      type: String,
      default: null,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedToName: {
      type: String,
      default: null,
    },
    images: [
      {
        type: String,
      },
    ],
    resolutionEvidence: [
      {
        type: String,
      },
    ],
    aiConfidence: {
      type: Number,
      default: null,
      min: 0,
      max: 1,
    },
    cctvCameraId: {
      type: String,
      default: null,
    },
    aiLocationKey: {
      type: String,
      default: null,
      index: true,
    },
    aiDetectionFrame: {
      type: String,
      default: null,
    },
    remarks: [RemarkSchema],
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate human-friendly unique ID if not provided
ComplaintSchema.pre('save', function (next) {
  if (!this.complaintId) {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    this.complaintId = `CIV-${new Date().getFullYear()}-${randomHex}`;
  }
  next();
});

export default mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
