const { z } = require('zod');

// Schema definitions
const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().min(1, 'Description is required').trim(),
  required_skills: z.array(z.string()).default([]),
  preferred_skills: z.array(z.string()).default([]),
  min_experience: z.coerce.number().min(0, 'Experience must be 0 or greater'),
  workflow_spec_id: z.string().optional().default('default-hiring-workflow'),
  status: z.enum(['active', 'inactive']).optional().default('active')
});

const updateJobSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').trim().optional(),
  description: z.string().min(1, 'Description cannot be empty').trim().optional(),
  required_skills: z.array(z.string()).optional(),
  preferred_skills: z.array(z.string()).optional(),
  min_experience: z.coerce.number().min(0, 'Experience must be 0 or greater').optional(),
  workflow_spec_id: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional()
});

const candidateSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  phone: z.string().optional().default(''),
  jobId: z.string().min(1, 'Job ID is required')
});

// Middleware generator
const validate = (schema) => (req, res, next) => {
  try {
    // Parse request body
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMsg = error.issues.map(err => err.message).join(', ');
      return res.status(400).json({ success: false, error: errorMsg });
    }
    next(error);
  }
};

module.exports = {
  validateSignup: validate(signupSchema),
  validateLogin: validate(loginSchema),
  validateJob: validate(jobSchema),
  validateUpdateJob: validate(updateJobSchema),
  validateCandidate: validate(candidateSchema)
};
