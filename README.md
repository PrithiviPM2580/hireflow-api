# hireflow-api

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
Yes. If your goal is a **production-level Node.js backend for your internship CV**, I would **not** make a basic todo, blog, or simple e-commerce CRUD.

I recommend building a **Job Marketplace / Hiring Platform API**.



Yes. If you're using **MongoDB + Mongoose**, I’d slightly change the design from the PostgreSQL/Prisma version.

 For HireFlow, don't create 15 models immediately. Start with the **core models**, then add the advanced ones.

 ## 1\. `User` — authentication + identity

 This should be your central account model.

```
User
├── _id
├── name
├── email
├── passwordHash
├── role
├── isVerified
├── isActive
├── failedLoginAttempts
├── lockedUntil
├── createdAt
└── updatedAt
```

 Example:

```
{
  name: "John Doe",
  email: "john@example.com",
  passwordHash: "...",
  role: "CANDIDATE",
  isVerified: true,
  isActive: true
}
```

 Roles:

```
CANDIDATE
RECRUITER
ADMIN
```

 **Don't store the actual password.**

---

 # 2\. `CandidateProfile`

 Don't put the entire candidate profile inside `User`.

```
CandidateProfile
├── userId
├── bio
├── phone
├── location
├── skills
├── experience
├── education
├── resumeUrl
└── portfolioUrl
```

 For MongoDB, you can actually embed `skills`, `experience`, and `education` inside the candidate document.

 For example:

```
{
  userId: "...",

  bio: "Backend developer interested in Node.js",

  location: "Nepal",

  skills: [
    "Node.js",
    "Express",
    "MongoDB",
    "TypeScript"
  ],

  experience: [
    {
      company: "ABC Tech",
      position: "Backend Intern",
      startDate: "...",
      endDate: "...",
      description: "..."
    }
  ],

  education: [
    {
      institution: "XYZ University",
      degree: "BSc Computer Science",
      startDate: "...",
      endDate: "..."
    }
  ],

  resumeUrl: "...",
  portfolioUrl: "..."
}
```

 This is actually one place where MongoDB's document model works nicely.

---

 # 3\. `Company`

 Recruiters belong to companies.

```
Company
├── _id
├── name
├── description
├── website
├── logoUrl
├── location
├── industry
└── createdAt
```

 You can then have:

```
Recruiter/User
      │
      │ companyId
      ↓
   Company
```

 You don't necessarily need a separate `RecruiterProfile` initially.

 Your `User` can have:

```
{
  role: "RECRUITER",
  companyId: "..."
}
```

 If recruiters eventually need lots of additional information, then create `RecruiterProfile`.

---

 # 4\. `Job`

 This is one of your main models.

```
Job
├── _id
├── recruiterId
├── companyId
├── title
├── description
├── location
├── employmentType
├── experienceLevel
├── salary
├── skills
├── status
├── applicationCount
├── expiresAt
├── createdAt
└── updatedAt
```

 Example:

```
{
  recruiterId: "...",
  companyId: "...",

  title: "Backend Developer",

  description: "We are looking for...",

  location: "Remote",

  employmentType: "FULL_TIME",

  experienceLevel: "JUNIOR",

  salary: {
    min: 50000,
    max: 100000,
    currency: "USD"
  },

  skills: [
    "Node.js",
    "Express",
    "MongoDB"
  ],

  status: "PUBLISHED",

  applicationCount: 12
}
```

---

 # 5\. `Application`

 This is probably your **most important business model**.

```
Application
├── _id
├── jobId
├── candidateId
├── resumeUrl
├── coverLetter
├── status
├── appliedAt
├── updatedAt
└── timestamps
```

 For example:

```
{
  jobId: "...",
  candidateId: "...",

  resumeUrl: "...",

  coverLetter: "I am interested in this position...",

  status: "SCREENING",

  appliedAt: "..."
}
```

 Statuses:

```
APPLIED
SCREENING
INTERVIEW
OFFER
HIRED
REJECTED
WITHDRAWN
```

 You should also enforce that a candidate **cannot apply to the same job twice**.

 With MongoDB, you'd create a compound unique index:

```
applicationSchema.index(
  { jobId: 1, candidateId: 1 },
  { unique: true }
);
```

 That's a great real-world backend detail to discuss in an interview.

---

 # 6\. `RefreshToken` / `Session`

 For authentication:

```
RefreshToken
├── _id
├── userId
├── tokenHash
├── expiresAt
├── revokedAt
├── createdAt
└── userAgent / ipAddress (optional)
```

 Don't store raw refresh tokens if you can avoid it.

 This allows:

```
Login
  ↓
Access Token
  ↓
Refresh Token
  ↓
Store hashed refresh token
```

 Then you can implement **refresh-token rotation** and logout.

---

 # 7\. `Notification`

 You'll need this when you introduce background jobs.

```
Notification
├── _id
├── userId
├── type
├── title
├── message
├── isRead
├── data
└── createdAt
```

 Example:

```
{
  userId: "...",

  type: "APPLICATION_STATUS_CHANGED",

  title: "Application Update",

  message: "Your application moved to Interview.",

  isRead: false
}
```

---

 # 8\. `Interview`

 For interview scheduling:

```
Interview
├── _id
├── applicationId
├── candidateId
├── recruiterId
├── scheduledAt
├── duration
├── timezone
├── meetingUrl
├── status
├── notes
└── createdAt
```

 Statuses could be:

```
SCHEDULED
RESCHEDULED
COMPLETED
CANCELLED
```

 The `timezone` field is important because you're dealing with real people in potentially different locations.

---

 # 9\. `PasswordResetToken`

 For:

```
POST /auth/forgot-password
POST /auth/reset-password
```

 You can use a separate collection:

```
PasswordResetToken
├── _id
├── userId
├── tokenHash
├── expiresAt
├── usedAt
└── createdAt
```

 You can also use MongoDB's **TTL index** so expired reset-token documents automatically disappear.

---

 # 10\. Optional: `EmailVerificationToken`

 For:

```
POST /auth/register
        ↓
verification email
        ↓
verify account
```

 Model:

```
EmailVerificationToken
├── _id
├── userId
├── tokenHash
├── expiresAt
├── usedAt
└── createdAt
```

 Again, a TTL index is useful.

---

 # Your final model structure

 I would build it like this:

```
models/
│
├── User.ts
├── CandidateProfile.ts
├── Company.ts
├── Job.ts
├── Application.ts
├── RefreshToken.ts
├── Notification.ts
├── Interview.ts
├── PasswordResetToken.ts
└── EmailVerificationToken.ts
```

 But **don't build all of them on day one**.

 ## Build in this order

 ### Phase 1 — Authentication

```
User
RefreshToken
PasswordResetToken
EmailVerificationToken
```

 Get these working:

```
Register
Login
Refresh
Logout
Email verification
Forgot password
Reset password
```

 ### Phase 2 — Core hiring system

```
CandidateProfile
Company
Job
Application
```

 Then you can build:

```
POST /jobs
GET /jobs
GET /jobs/:id
POST /jobs/:id/apply
GET /applications/me
GET /jobs/:jobId/applications
PATCH /applications/:id/status
```

 ### Phase 3 — Advanced features

```
Notification
Interview
```

 Then introduce:

```
Redis
BullMQ
Email
Background workers
```

---

 ## One MongoDB-specific decision

 Unlike PostgreSQL, **don't automatically make every concept a separate collection**.

 MongoDB lets you embed data when it naturally belongs to its parent.

 For example, I'd probably do:

```
CandidateProfile
    │
    ├── skills[]
    ├── experience[]
    └── education[]
```

 rather than:

```
Candidate
Skill
Experience
Education
```

 For your project, that's simpler and demonstrates that you understand **why MongoDB's document model is useful**, rather than just using MongoDB as "SQL but different."

 The core relationships would look like:

```
                    User
                 /    |    \
                /     |     \
        Candidate  Recruiter  Admin
            |          |
            |       Company
            |          |
            |         Jobs
            |          |
            └──── Applications
                       |
                   Interviews
                       |
                  Notifications
```

 **If you're learning this project to understand backend architecture, I'd start with just `User → Company → Job → Application` and build those four properly before adding anything else.**


 Absolutely. Since you're using **MongoDB + Mongoose + TypeScript**, let's define the schemas for the models we discussed.

 I'd structure them like this:

```
src/
└── modules/
    ├── auth/
    │   ├── user.model.ts
    │   ├── refresh-token.model.ts
    │   ├── password-reset-token.model.ts
    │   └── email-verification-token.model.ts
    │
    ├── candidates/
    │   └── candidate-profile.model.ts
    │
    ├── companies/
    │   └── company.model.ts
    │
    ├── jobs/
    │   └── job.model.ts
    │
    ├── applications/
    │   └── application.model.ts
    │
    ├── interviews/
    │   └── interview.model.ts
    │
    └── notifications/
        └── notification.model.ts
```

 I'll keep the schemas practical rather than making them unnecessarily complicated.

 ## 1\. User Schema

 This is the most important one for authentication.

```
import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "CANDIDATE" | "RECRUITER" | "ADMIN";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;

  isVerified: boolean;
  isActive: boolean;

  failedLoginAttempts: number;
  lockedUntil?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["CANDIDATE", "RECRUITER", "ADMIN"],
      default: "CANDIDATE",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", userSchema);
```

 One important point: **never return `passwordHash` in API responses**. Later, you can also configure Mongoose to exclude it by default.

---

 # 2\. Candidate Profile Schema

 The authentication information stays in `User`.

 Professional information goes here.

```
import mongoose, { Schema, Document, Types } from "mongoose";

interface IExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
}

interface IEducation {
  institution: string;
  degree: string;
  field?: string;
  startDate: Date;
  endDate?: Date;
}

export interface ICandidateProfile extends Document {
  userId: Types.ObjectId;

  bio?: string;
  phone?: string;
  location?: string;

  skills: string[];

  experience: IExperience[];

  education: IEducation[];

  resumeUrl?: string;
  portfolioUrl?: string;
}

const experienceSchema = new Schema<IExperience>(
  {
    company: {
      type: String,
      required: true,
    },

    position: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
    },

    description: {
      type: String,
    },
  },
  { _id: false }
);

const educationSchema = new Schema<IEducation>(
  {
    institution: {
      type: String,
      required: true,
    },

    degree: {
      type: String,
      required: true,
    },

    field: {
      type: String,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
    },
  },
  { _id: false }
);

const candidateProfileSchema = new Schema<ICandidateProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    bio: {
      type: String,
      maxlength: 1000,
    },

    phone: {
      type: String,
    },

    location: {
      type: String,
    },

    skills: {
      type: [String],
      default: [],
    },

    experience: {
      type: [experienceSchema],
      default: [],
    },

    education: {
      type: [educationSchema],
      default: [],
    },

    resumeUrl: {
      type: String,
    },

    portfolioUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const CandidateProfile = mongoose.model<ICandidateProfile>(
  "CandidateProfile",
  candidateProfileSchema
);
```

---

 # 3\. Company Schema

```
import mongoose, { Schema, Document } from "mongoose";

export interface ICompany extends Document {
  name: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  location?: string;
  industry?: string;

  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      maxlength: 2000,
    },

    website: {
      type: String,
    },

    logoUrl: {
      type: String,
    },

    location: {
      type: String,
    },

    industry: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Company = mongoose.model<ICompany>(
  "Company",
  companySchema
);
```

---

 # 4\. Job Schema

 This one needs good indexes because you'll eventually search/filter jobs heavily.

```
import mongoose, { Schema, Document, Types } from "mongoose";

export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP";

export interface IJob extends Document {
  recruiterId: Types.ObjectId;
  companyId: Types.ObjectId;

  title: string;
  description: string;

  location: string;
  employmentType: EmploymentType;
  experienceLevel: string;

  salary?: {
    min?: number;
    max?: number;
    currency: string;
  };

  skills: string[];

  status: JobStatus;

  applicationCount: number;

  expiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
      index: true,
    },

    employmentType: {
      type: String,
      enum: [
        "FULL_TIME",
        "PART_TIME",
        "CONTRACT",
        "INTERNSHIP",
      ],
      required: true,
    },

    experienceLevel: {
      type: String,
      required: true,
    },

    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: "USD",
      },
    },

    skills: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CLOSED"],
      default: "DRAFT",
      index: true,
    },

    applicationCount: {
      type: Number,
      default: 0,
    },

    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({
  title: "text",
  description: "text",
  skills: "text",
});

jobSchema.index({
  status: 1,
  createdAt: -1,
});

export const Job = mongoose.model<IJob>("Job", jobSchema);
```

 The indexes are important for the search functionality you'll build later.

---

 # 5\. Application Schema

 This is where things get interesting.

```
import mongoose, { Schema, Document, Types } from "mongoose";

export type ApplicationStatus =
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export interface IApplication extends Document {
  jobId: Types.ObjectId;
  candidateId: Types.ObjectId;

  resumeUrl?: string;
  coverLetter?: string;

  status: ApplicationStatus;

  appliedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resumeUrl: {
      type: String,
    },

    coverLetter: {
      type: String,
      maxlength: 5000,
    },

    status: {
      type: String,
      enum: [
        "APPLIED",
        "SCREENING",
        "INTERVIEW",
        "OFFER",
        "HIRED",
        "REJECTED",
        "WITHDRAWN",
      ],
      default: "APPLIED",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent candidate from applying to same job twice
applicationSchema.index(
  {
    jobId: 1,
    candidateId: 1,
  },
  {
    unique: true,
  }
);

applicationSchema.index({
  candidateId: 1,
  createdAt: -1,
});

applicationSchema.index({
  jobId: 1,
  status: 1,
});

export const Application = mongoose.model<IApplication>(
  "Application",
  applicationSchema
);
```

 That compound unique index is **very important**.

 It means MongoDB itself helps enforce:

```
Candidate A + Job X → one application
Candidate A + Job X → ❌ duplicate
```

---

 # 6\. Refresh Token Schema

```
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

export const RefreshToken = mongoose.model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema
);
```

 Later you can add a TTL index to automatically remove expired tokens.

---

 # 7\. Password Reset Token

```
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPasswordResetToken extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
}

const passwordResetTokenSchema =
  new Schema<IPasswordResetToken>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      tokenHash: {
        type: String,
        required: true,
      },

      expiresAt: {
        type: Date,
        required: true,
      },

      usedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

// Automatically delete expired tokens
passwordResetTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export const PasswordResetToken =
  mongoose.model<IPasswordResetToken>(
    "PasswordResetToken",
    passwordResetTokenSchema
  );
```

---

 # 8\. Email Verification Token

 Very similar:

```
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEmailVerificationToken extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
}

const emailVerificationTokenSchema =
  new Schema<IEmailVerificationToken>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      tokenHash: {
        type: String,
        required: true,
      },

      expiresAt: {
        type: Date,
        required: true,
      },

      usedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

emailVerificationTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export const EmailVerificationToken =
  mongoose.model<IEmailVerificationToken>(
    "EmailVerificationToken",
    emailVerificationTokenSchema
  );
```

---

 # 9\. Notification Schema

```
import mongoose, { Schema, Document, Types } from "mongoose";

export type NotificationType =
  | "APPLICATION_RECEIVED"
  | "APPLICATION_STATUS_CHANGED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_RESCHEDULED"
  | "INTERVIEW_CANCELLED";

export interface INotification extends Document {
  userId: Types.ObjectId;

  type: NotificationType;

  title: string;
  message: string;

  isRead: boolean;

  data?: Record<string, unknown>;

  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "APPLICATION_RECEIVED",
        "APPLICATION_STATUS_CHANGED",
        "INTERVIEW_SCHEDULED",
        "INTERVIEW_RESCHEDULED",
        "INTERVIEW_CANCELLED",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    data: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

notificationSchema.index({
  userId: 1,
  isRead: 1,
  createdAt: -1,
});

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
```

---

 # 10\. Interview Schema

```
import mongoose, { Schema, Document, Types } from "mongoose";

export type InterviewStatus =
  | "SCHEDULED"
  | "RESCHEDULED"
  | "COMPLETED"
  | "CANCELLED";

export interface IInterview extends Document {
  applicationId: Types.ObjectId;

  candidateId: Types.ObjectId;
  recruiterId: Types.ObjectId;

  scheduledAt: Date;
  duration: number;
  timezone: string;

  meetingUrl?: string;

  status: InterviewStatus;

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const interviewSchema = new Schema<IInterview>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
    },

    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
      min: 15,
      max: 240,
    },

    timezone: {
      type: String,
      required: true,
    },

    meetingUrl: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "SCHEDULED",
        "RESCHEDULED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "SCHEDULED",
    },

    notes: {
      type: String,
      maxlength: 3000,
    },
  },
  {
    timestamps: true,
  }
);

interviewSchema.index({
  candidateId: 1,
  scheduledAt: 1,
});

interviewSchema.index({
  recruiterId: 1,
  scheduledAt: 1,
});

export const Interview = mongoose.model<IInterview>(
  "Interview",
  interviewSchema
);
```

---

 # The whole database now looks like this

```
MongoDB
│
├── users
│   ├── authentication
│   ├── role
│   └── account security
│
├── candidateprofiles
│   ├── skills
│   ├── experience
│   ├── education
│   └── resume
│
├── companies
│
├── jobs
│
├── applications
│
├── refreshtokens
│
├── passwordresettokens
│
├── emailverificationtokens
│
├── notifications
│
└── interviews
```

 And the main relationships are:

```
User
 │
 ├──────── CandidateProfile
 │
 ├──────── Company (if recruiter)
 │
 ├──────── RefreshTokens
 │
 ├──────── Applications
 │
 ├──────── Notifications
 │
 └──────── Interviews
              │
              ↓
         Application
              │
              ↓
             Job
              │
              ↓
           Company
```

 ### But don't code all of this now

 For your learning path, I strongly recommend starting with only:

```
User
Company
Job
Application
```

 Get these four working end-to-end first:

```
Register
   ↓
Login
   ↓
Recruiter creates Company
   ↓
Recruiter creates Job
   ↓
Candidate views Jobs
   ↓
Candidate applies
   ↓
Recruiter views Applications
   ↓
Recruiter changes Application status
```

 Once that works, add `CandidateProfile`, then refresh tokens/password reset, and only afterward move to notifications, BullMQ, and interviews.

 That progression will teach you **why each model exists**, instead of just giving you a giant MongoDB schema to copy.
